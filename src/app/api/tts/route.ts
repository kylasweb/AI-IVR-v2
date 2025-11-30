import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

type TTSRequest = {
    text?: string
    voice?: string
    format?: string
}

const CACHE_DIR = path.join(process.cwd(), '.cache', 'tts')

// Max cache size in bytes (default 200 MB). Can be overridden by env var TTS_CACHE_MAX_BYTES
const MAX_CACHE_BYTES = parseInt(process.env.TTS_CACHE_MAX_BYTES || `${200 * 1024 * 1024}`, 10)

async function ensureCacheDir() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true })
    } catch (e) {
        // ignore
    }
}

async function maintainCacheLimit() {
    try {
        const files = await fs.readdir(CACHE_DIR)
        const entries: { binPath: string; metaPath: string; size: number; mtimeMs: number }[] = []
        for (const f of files) {
            if (!f.endsWith('.bin')) continue
            const binPath = path.join(CACHE_DIR, f)
            try {
                const st = await fs.stat(binPath)
                entries.push({ binPath, metaPath: binPath.replace(/\.bin$/, '.meta.json'), size: st.size, mtimeMs: st.mtimeMs })
            } catch (e) {
                // skip unreadable
            }
        }

        let total = entries.reduce((s, e) => s + e.size, 0)
        if (total <= MAX_CACHE_BYTES) return

        // sort by mtime asc (oldest first)
        entries.sort((a, b) => a.mtimeMs - b.mtimeMs)
        for (const e of entries) {
            try {
                await fs.unlink(e.binPath)
            } catch (err) {
                // ignore
            }
            try {
                await fs.unlink(e.metaPath)
            } catch (err) {
                // ignore
            }
            total -= e.size
            if (total <= MAX_CACHE_BYTES) break
        }
    } catch (err) {
        // ignore maintenance errors
    }
}

function hashKey(text: string, opts?: { voice?: string; format?: string }) {
    const h = crypto.createHash('sha256')
    h.update(text)
    if (opts?.voice) h.update('\nvoice:' + opts.voice)
    if (opts?.format) h.update('\nformat:' + opts.format)
    return h.digest('hex')
}

export async function POST(req: Request) {
    try {
        const body: TTSRequest = await req.json()
        const text = (body.text || '').trim()
        const voice = body.voice
        const format = body.format
        if (!text) {
            return NextResponse.json({ error: 'Missing `text` in request body' }, { status: 400 })
        }

        const HF_MODEL = 'kenpath/svara-tts-v1'
        const HF_TOKEN = process.env.HF_API_TOKEN
        if (!HF_TOKEN) return NextResponse.json({ error: 'HF_API_TOKEN not set' }, { status: 500 })

        // Basic safety: limit length to something reasonable for inference
        if (text.length > 5000) {
            return NextResponse.json({ error: 'Text too long' }, { status: 400 })
        }

        await ensureCacheDir()
        const key = hashKey(text, { voice, format })
        const cachePath = path.join(CACHE_DIR, `${key}.bin`)
        const metaPath = path.join(CACHE_DIR, `${key}.meta.json`)

        // If cached, return cached file
        try {
            const buf = await fs.readFile(cachePath)
            let meta: any = { contentType: 'audio/wav' }
            try {
                const m = await fs.readFile(metaPath, 'utf8')
                meta = JSON.parse(m)
            } catch (e) {
                // ignore meta read errors
            }
            return new Response(buf, {
                status: 200,
                headers: {
                    'Content-Type': meta.contentType || 'audio/wav',
                    'X-Cache': 'HIT',
                    'Cache-Control': 'public, max-age=86400'
                }
            })
        } catch (e) {
            // cache miss — continue to fetch
        }

        const payload: any = {
            inputs: text,
            options: { wait_for_model: true },
            parameters: {
                // model-specific params can go here; populate with voice/format if needed
            }
        }

        // If a local inference URL is provided, try it first. If it fails, fall back to HF.
        const LOCAL_URL = process.env.LOCAL_TTS_URL
        let buffer: Buffer
        let contentType: string | null = null

        if (LOCAL_URL) {
            try {
                const localRes = await fetch(LOCAL_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/octet-stream' },
                    body: JSON.stringify({ text, voice, format }),
                })
                if (localRes.ok) {
                    const ab = await localRes.arrayBuffer()
                    buffer = Buffer.from(ab)
                    contentType = localRes.headers.get('content-type') || 'audio/wav'
                } else {
                    // try HF below
                    const txt = await localRes.text().catch(() => null)
                    console.warn('Local TTS responded with non-OK:', localRes.status, txt)
                }
            } catch (e) {
                console.warn('Local TTS request failed, falling back to HF:', String(e))
            }
        }

        if (!buffer) {
            const hfRes = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/octet-stream'
                },
                body: JSON.stringify(payload),
            })

            if (!hfRes.ok) {
                const textErr = await hfRes.text().catch(() => null)
                return NextResponse.json({ error: 'HF inference failed', details: textErr }, { status: hfRes.status || 500 })
            }

            const arrayBuffer = await hfRes.arrayBuffer()
            buffer = Buffer.from(arrayBuffer)
            contentType = hfRes.headers.get('content-type') || 'audio/wav'
        }

        // Write to cache (best-effort) and maintain cache size
        try {
            await fs.writeFile(cachePath, buffer)
            await fs.writeFile(metaPath, JSON.stringify({ contentType }, null, 2))
            // asynchronously maintain cache size (don't block response on cleanup)
            maintainCacheLimit().catch(() => { })
        } catch (e) {
            // ignore cache write errors
        }

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'X-Cache': 'MISS',
                'Cache-Control': 'public, max-age=86400'
            }
        })
    } catch (err: any) {
        return NextResponse.json({ error: 'Server error', details: err?.message || String(err) }, { status: 500 })
    }
}
