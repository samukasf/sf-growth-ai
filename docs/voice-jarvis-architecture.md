# Samuel Voice — Jarvis-style reliability architecture

## Why this exists

Production telemetry proved that the browser frequently bootstraps Live voice and then falls back to turn-based transcription. A usable assistant cannot depend on provider-native interruption alone.

The reliable path therefore separates four concerns, following the architecture observed in `isair/jarvis`:

1. **Continuous microphone capture** — stays open for the whole voice session.
2. **Client-side VAD** — detects speech starts/ends independent of TTS/model state.
3. **Independent response audio** — speech playback can be cancelled instantly without closing the microphone.
4. **Echo/interrupt controller** — user activity while Samuel speaks stops playback immediately; final STT is compared with Samuel's spoken text to reject echo while preserving real commands.

## Primary flow

`Mic -> client VAD -> utterance recorder -> STT -> existing Samuel chat/action runtime -> neural TTS -> audio`

The next utterance starts without another microphone click. The same `/api/samuel-ai/chat` path remains the brain so Gmail, Google Calendar and other action proposals keep the same policies and confirmation tokens.

## Barge-in

While Samuel is speaking, the microphone remains live. Sustained user energy cancels playback immediately and begins a new utterance. Acoustic echo cancellation remains enabled. Final transcription goes through echo checks before it is submitted.

Fast stop phrases (for example `para`, `pare`, `chega`, `silêncio`, `stop`) are accepted before echo rejection so the user can always silence Samuel.

## Provider Live mode

Gemini/OpenAI Realtime remains available as an optional fast path and diagnostic capability, but it is not allowed to be the only route to a working conversation. The deterministic Jarvis-style pipeline is the reliability baseline.

## Calendar and other tools

Voice turns go through the existing Samuel chat runtime. Mutating Google Calendar/Gmail operations continue to require the existing confirmation mechanism. The voice controller can accept a spoken confirmation and trigger the same UI confirmation action rather than inventing a second security path.
