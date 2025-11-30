import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.cache', 'tts')

async function readCacheEntries() {
    try {
        const files = await fs.readdir(CACHE_DIR)
        const entries: { key: string; size: number; mtimeMs: number }[] = []
        for (const f of files) {
            if (!f.endsWith('.bin')) continue
            const binPath = path.join(CACHE_DIR, f)
            try {
                const st = await fs.stat(binPath)
                entries.push({ key: f.replace(/\.bin$/, ''), size: st.size, mtimeMs: st.mtimeMs })
            } catch (e) {
                // skip
            }
        }
        return entries.sort((a, b) => b.mtimeMs - a.mtimeMs)
    } catch (e) {
        return []
    }
}

export async function GET() {
    const entries = await readCacheEntries()
    const total = entries.reduce((s, e) => s + e.size, 0)
    return NextResponse.json({ count: entries.length, totalBytes: total, entries: entries.slice(0, 200) })
}

export async function POST(req: Request) {
    // Purge cache
    try {
        const files = await fs.readdir(CACHE_DIR)
        let removed = 0
        for (const f of files) {
            if (!f.endsWith('.bin') && !f.endsWith('.meta.json')) continue
            try {
                await fs.unlink(path.join(CACHE_DIR, f))
                removed++
            } catch (e) {
                // ignore
            }
        }
        return NextResponse.json({ removed })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
    }
}
