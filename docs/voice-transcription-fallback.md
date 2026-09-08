# Samuel voice transcription fallback

The browser records microphone audio with `MediaRecorder` and posts it to `/api/samuel-ai/transcribe`.

Provider order:

1. OpenAI `gpt-4o-mini-transcribe` when `OPENAI_API_KEY` is available and operational.
2. Gemini audio understanding when OpenAI is unavailable, rate-limited, out of credit, or not configured.

Gemini key lookup order:

- `GEMINI_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `GOOGLE_API_KEY`

Optional model override: `GEMINI_TRANSCRIPTION_MODEL`.

The route never exposes provider keys to the browser. Authentication and company authorization run before the audio is sent to either provider.
