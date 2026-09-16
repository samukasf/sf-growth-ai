"use client";

import { Film, Sparkles } from "lucide-react";

import { SamuelAiFocusV4 } from "./SamuelAiFocusV4";
import type {
  ExecutiveWorkspaceData,
  ExecutiveWorkspaceHandlers,
} from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";

type Props = {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
};

export function SamuelAiFocusV5(props: Props) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <SamuelAiFocusV4 {...props} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      >
        <span className="absolute left-[38%] top-[20%] size-1 animate-ping rounded-full bg-cyan-200/80 [animation-duration:2.6s]" />
        <span className="absolute left-[54%] top-[31%] size-1 animate-ping rounded-full bg-violet-200/70 [animation-delay:.8s] [animation-duration:3.2s]" />
        <span className="absolute left-[48%] top-[58%] size-1 animate-ping rounded-full bg-amber-100/70 [animation-delay:1.5s] [animation-duration:3.8s]" />
        <div className="absolute left-[31%] top-[19%] hidden size-[430px] animate-[spin_38s_linear_infinite] rounded-full border border-cyan-300/[.08] 2xl:block motion-reduce:animate-none" />
        <div className="absolute left-[34%] top-[22%] hidden size-[360px] animate-[spin_24s_linear_infinite_reverse] rounded-full border border-violet-300/[.07] 2xl:block motion-reduce:animate-none" />
      </div>

      <button
        type="button"
        onClick={() => props.onNavigate("studio")}
        className="fixed bottom-[calc(5.8rem+env(safe-area-inset-bottom))] right-4 z-[70] flex min-h-12 items-center gap-2 rounded-2xl border border-cyan-300/35 bg-[#07213a]/95 px-4 text-xs font-semibold text-white shadow-[0_0_35px_rgba(0,166,255,.30)] backdrop-blur-xl transition hover:border-cyan-200 hover:bg-[#0a3155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 xl:bottom-6 xl:right-[360px] 2xl:right-[370px]"
        aria-label="Abrir criação de vídeos e redes"
      >
        <span className="relative flex size-8 items-center justify-center rounded-xl bg-cyan-300/10">
          <Film className="size-4 text-cyan-200" />
          <Sparkles className="absolute -right-1 -top-1 size-3 text-violet-200" />
        </span>
        <span>Vídeos e Redes</span>
      </button>
    </div>
  );
}
