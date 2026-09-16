"use client";

import { Film } from "lucide-react";

import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";
import { SamuelAiFocusV4 } from "./SamuelAiFocusV4";

type Props = {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
};

export function SamuelAiFocusV5(props: Props) {
  return (
    <div className="samuel-v5-shell relative h-dvh w-full overflow-hidden">
      <SamuelAiFocusV4 {...props} />
      <button
        type="button"
        onClick={() => props.onNavigate("studio")}
        className="fixed right-4 top-[max(.8rem,env(safe-area-inset-top))] z-[80] hidden min-h-11 items-center gap-2 rounded-xl border border-cyan-300/30 bg-[#06182a]/95 px-4 text-xs font-semibold text-cyan-50 shadow-[0_0_30px_rgba(0,164,255,.22)] backdrop-blur-xl transition hover:border-cyan-200/55 hover:bg-[#09233d] xl:flex 2xl:right-[390px]"
      >
        <Film className="size-4 text-cyan-300" />
        Vídeos & Redes
      </button>
    </div>
  );
}
