# Samuel voice transcription fallback

The browser segments microphone PCM audio, encodes each completed turn as WAV, and posts it to `/api/samuel-ai/transcribe`.

Provider order:

1. ElevenLabs `scribe_v2` when `ELEVENLABS_API_KEY` is available and operational.
2. OpenAI `gpt-4o-mini-transcribe` when ElevenLabs is unavailable.
3. Gemini audio understanding when both previous providers are unavailable, rate-limited, out of credit, or not configured.

Gemini key lookup order:

- `GEMINI_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `GOOGLE_API_KEY`

Optional model override: `GEMINI_TRANSCRIPTION_MODEL`.

Optional ElevenLabs model override: `ELEVENLABS_TRANSCRIPTION_MODEL`.

The route never exposes provider keys to the browser. Authentication and company authorization run before the audio is sent to either provider.
