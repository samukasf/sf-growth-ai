"use client";

import { useEffect } from "react";

/**
 * Keeps Samuel's primary microphone useful even when a provider Realtime
 * session cannot be established. The existing ChatPanel already has a tested
 * browser SpeechRecognition path (dictation -> auto send -> spoken reply),
 * but the immersive UI previously hid that control and exposed only Realtime.
 *
 * In the immersive Samuel surface, route the visible microphone to that
 * browser voice path. Realtime remains available internally and can be
 * re-enabled later without making basic conversation depend on WebRTC.
 */
export function SamuelVoiceReliabilityBridge() {
  useEffect(() => {
    const onPrimaryVoiceClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const primaryButton = target.closest<HTMLButtonElement>(
        ".samuel-focus-cockpit .samuel-voice-console__start",
      );
      if (!primaryButton) return;

      const cockpit = primaryButton.closest<HTMLElement>(".samuel-focus-cockpit");
      const dictationButton = cockpit?.querySelector<HTMLButtonElement>(
        ".samuel-chat-dictation",
      );

      if (!dictationButton || dictationButton.disabled) return;

      // Stop the Realtime button handler from becoming the single point of
      // failure. Trigger ChatPanel's browser speech-recognition handler instead.
      event.preventDefault();
      event.stopImmediatePropagation();

      window.setTimeout(() => {
        if (!dictationButton.disabled) dictationButton.click();
      }, 0);
    };

    window.addEventListener("click", onPrimaryVoiceClick, true);
    return () => window.removeEventListener("click", onPrimaryVoiceClick, true);
  }, []);

  return null;
}
