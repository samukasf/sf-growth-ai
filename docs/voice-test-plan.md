# Samuel Voice — validation plan

## Automated gates

- `npm test`: provider selection, ElevenLabs request contract, secret redaction, ElevenLabs → OpenAI failover, browser provider labels and the existing VAD/STT/chat tests.
- `npm run lint`: no new ESLint errors.
- `npm run build`: production Next.js compilation and route type validation.

## Server checks

1. With both keys configured, call the authenticated `GET /api/samuel-ai/voice/diagnostics?probe=1` and verify:
   - `tts.preferredProvider` is `elevenlabs`;
   - the selected voice probe succeeds;
   - `fallback.speechOrder` starts with `elevenlabs`, then `openai`;
   - no API key appears in the response.
2. Generate a short response through `POST /api/samuel-ai/voice/tts` and verify the MP3 plus `X-Samuel-TTS-*` metadata headers.
3. Use an invalid ElevenLabs key in a non-production environment and verify that OpenAI answers with `X-Samuel-TTS-Fallback: true`.

## Browser acceptance

Test Chrome desktop, Safari iPhone and Chrome Android:

1. Open Samuel, make one user gesture and select **Ouvir resposta**.
2. Confirm that the UI names the actual neural provider and audio starts after the network response.
3. Start continuous voice, speak two consecutive turns and confirm the microphone does not need to be reopened.
4. Interrupt Samuel while he is speaking and confirm playback stops without closing the microphone.
5. Temporarily block both remote TTS providers and confirm browser/Piper fallback instead of a silent failure.
6. Cancel playback, navigate away and confirm no orphan audio continues.

## Production smoke test

After deploy, use a real authenticated company and a short Portuguese phrase. Check provider, model, latency, request ID and fallback flag in server logs. Never log request headers, API keys or full spoken business content.
