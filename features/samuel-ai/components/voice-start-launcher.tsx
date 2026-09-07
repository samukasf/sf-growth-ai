"use client";

import { Mic, Radio } from "lucide-react";

export function VoiceStartLauncher() {
  function startVoiceConversation() {
    const button = document.querySelector<HTMLButtonElement>(
      ".samuel-voice-console__start",
    );

    if (!button) return;

    button.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => button.click(), 220);
  }

  return (
    <div className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 md:bottom-7">
      <button
        type="button"
        onClick={startVoiceConversation}
        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-cyan-300/40 bg-slate-950/95 px-5 py-4 text-left text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition hover:border-cyan-200/70 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        aria-label="Iniciar conversa por voz com Samuel"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/20">
            <Mic className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
              Samuel Voice
            </span>
            <strong className="block truncate text-base font-semibold">
              Iniciar conversa por voz
            </strong>
          </span>
        </span>
        <Radio className="h-5 w-5 shrink-0 text-cyan-200 transition group-hover:scale-110" aria-hidden="true" />
      </button>
    </div>
  );
}
