"use client";

import { useEffect } from "react";

/**
 * Routes the visible primary microphone to ChatPanel's browser
 * SpeechRecognition control without leaving the original user-activation task.
 *
 * SpeechRecognition can be rejected when start() is triggered after a timer or
 * another async boundary. Keep this dispatch synchronous so the browser still
 * considers it part of the user's click and can open/use the microphone.
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

      event.preventDefault();
      event.stopImmediatePropagation();

      // IMPORTANT: no setTimeout / Promise / async boundary here. The nested
      // click must happen inside the original trusted user activation so Chrome
      // can start SpeechRecognition and request microphone permission.
      dictationButton.click();
    };

    window.addEventListener("click", onPrimaryVoiceClick, true);
    return () => window.removeEventListener("click", onPrimaryVoiceClick, true);
  }, []);

  return null;
}
