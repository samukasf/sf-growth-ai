# Samuel AI voice — open-source implementation review

Date: 2026-09-09

This review was done to avoid repeatedly tuning one provider-specific Realtime path. The target is a voice assistant that remains usable when a realtime provider, browser API or external integration degrades.

## Projects reviewed

### isair/jarvis

Repository: `isair/jarvis`

Relevant patterns:

- microphone/listening is a subsystem independent from TTS;
- explicit `is_speaking()` state;
- stop commands are handled on a fast path while TTS is active;
- echo detection compares captured input with the assistant's spoken output;
- Whisper is used as a robust speech-recognition path;
- TTS can be interrupted rather than forcing the user to wait for playback to finish;
- a post-turn hot window keeps the interaction conversational.

Adopted in Samuel:

- independent microphone and response-audio lifecycles;
- fast stop phrases;
- second-stage transcript echo rejection;
- continuous session instead of one microphone click per sentence.

### Pipecat (`pipecat-ai/pipecat`)

License: BSD-2-Clause.

Relevant patterns:

- voice is treated as a pipeline (transport → VAD → STT → LLM/tools → TTS);
- Silero VAD is commonly used instead of trusting raw amplitude alone;
- interruption and turn management are explicit pipeline concerns;
- provider services can be replaced independently.

Adopted in Samuel:

- clear STT/brain/tools/TTS separation;
- provider failover without changing the conversation runtime;
- turn detection as a standalone, tested module rather than UI state.

### LiveKit Agents / Agents JS (`livekit/agents`, `livekit/agents-js`)

Agents framework license: Apache-2.0. LiveKit's hosted/model turn detectors may have separate model terms and were not vendored into this project.

Relevant implementation values in the open Agents JS interruption subsystem:

- 16 kHz speech processing;
- 25 ms analysis frames;
- interruption after multiple consecutive frames rather than one audio spike;
- an audio prefix/pre-roll to avoid clipping the first syllable;
- interruption is separate from normal end-of-turn detection;
- retry/timeouts are explicit rather than implicit.

Adopted in Samuel:

- 16 kHz canonical PCM;
- short consecutive-frame confirmation for speech/barge-in;
- stricter interruption threshold while Samuel audio is playing;
- 750 ms local pre-roll;
- deterministic timeouts and telemetry.

### ricky0123/vad

License: ISC; bundled Silero VAD model: MIT.

Relevant patterns:

- mature browser-side voice activity detection;
- Silero VAD through ONNX Runtime Web;
- callbacks return 16 kHz Float32 speech segments directly.

Decision for this patch:

- do not add it as a hard dependency yet. The project currently has open reports around some mobile/iPhone configurations and adding ONNX runtime/assets would increase bundle and deployment complexity.
- the Samuel controller now uses the same architectural contract (16 kHz PCM speech segments + local VAD gate) so Silero can be swapped in later without changing STT/chat/tools/TTS.

### Leon (`leon-ai/leon`)

License: MIT.

Relevant pattern:

- personal-assistant capabilities are modular skills rather than hard-coded voice branches.

Adopted direction:

- voice turns are routed to the existing Samuel chat/action runtime, so Google Calendar, Gmail, Desktop, CRM and future tools do not need separate voice implementations.

### OpenVoiceOS (`OpenVoiceOS/ovos-core`)

License: Apache-2.0.

Relevant pattern:

- assistant core, skills and message/event plumbing are separate modules.

Adopted direction:

- voice capture publishes a normalized turn; business actions continue through their existing authenticated modules and confirmation policies.

## Architecture selected for SF Growth AI

```text
Browser microphone (AEC/noise suppression)
        │
        ▼
Continuous PCM capture
        │
        ├── adaptive local turn detector
        │      ├── ambient-noise calibration
        │      ├── speech confirmation
        │      ├── 750 ms pre-roll
        │      └── barge-in gate
        │
        ▼
16 kHz mono WAV speech segment
        │
        ▼
STT provider router
   OpenAI transcription
        └── Gemini failover
        │
        ├── stop-command fast path
        ├── echo rejection
        ▼
Samuel chat + action runtime
        │
        ├── Calendar
        ├── Gmail
        ├── Desktop
        ├── CRM / other tools
        └── confirmation tokens for writes
        │
        ▼
Neural TTS
   OpenAI gpt-4o-mini-tts
        └── browser/Piper fallback
        │
        ▼
Independent cancellable audio output
```

## Reliability rules

1. Microphone state must never depend on TTS state.
2. Provider-native Realtime may be used as an optional accelerator, not as the only working path.
3. Barge-in cancels local audio immediately; it does not wait for a remote model event.
4. Mutating tools keep the same confirmation/security policy for text and voice.
5. An integration row in the database is not considered healthy until its token can actually be refreshed/validated.
6. Voice events are logged server-side so a future failure can be diagnosed from production telemetry instead of guessed from the UI.
7. No external project is copied wholesale. Only permissively licensed components/patterns are adopted, and model-specific licenses are kept separate.
