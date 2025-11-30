export async function fetchTTS(text: string, opts?: { voice?: string; format?: string }) {
    const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, ...opts }),
    })

    if (!res.ok) {
        let err
        try {
            err = await res.json()
        } catch (e) {
            err = { message: 'unknown error' }
        }
        throw new Error('TTS request failed: ' + JSON.stringify(err))
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    return {
        blob,
        url,
        play() {
            const audio = new Audio(url)
            audio.play()
            audio.onended = () => URL.revokeObjectURL(url)
            return audio
        }
    }
}
