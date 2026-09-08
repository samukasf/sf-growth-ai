"use client";

import Link from "next/link";
import { ArrowLeft, Bell, Grid2X2, MonitorSmartphone } from "lucide-react";
import { ChatPanel } from "../chat-panel";
import { AmbientParticleField } from "../shared/ambient-particle-field";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";

const EMPTY_CHAT_MESSAGES: [] = [];

type SamuelAiFocusProps = {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
};

export function SamuelAiFocus({ data, handlers, onNavigate }: SamuelAiFocusProps) {
  const companyName = data.executiveContext?.company.name ?? data.briefing.companyName ?? "SF Growth AI";
  const alerts = (data.watcherExecutive?.summary.criticalAlerts ?? 0) + (data.executiveMonitoring?.alerts.length ?? 0);

  return (
    <section className="samuel-focus-cockpit relative h-dvh w-full overflow-hidden bg-[#030507] text-white">
      <AmbientParticleField />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_18%,rgba(31,108,255,.12),transparent_64%),radial-gradient(circle_at_50%_55%,rgba(24,211,255,.035),transparent_35%)]" />

      <header className="absolute inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-4 sm:px-7">
        <button type="button" onClick={() => onNavigate("dashboard")} className="flex size-10 items-center justify-center rounded-full border border-white/[.08] bg-black/20 text-white/55 backdrop-blur-xl transition hover:bg-white/[.07] hover:text-white" aria-label="Voltar ao painel"><ArrowLeft className="size-[17px]" /></button>
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-center">
          <div className="flex items-center justify-center gap-2"><span className={`size-1.5 rounded-full ${handlers.isProcessing ? "animate-pulse bg-cyan-300" : "bg-emerald-300"}`} /><strong className="text-[11px] font-semibold tracking-[.16em] text-white/80">SAMUEL</strong></div>
          <p className="mt-0.5 max-w-44 truncate text-[8px] uppercase tracking-[.15em] text-white/25">{companyName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/samuel-ai/desktop" className="flex size-10 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-300/[.04] text-cyan-100/65 backdrop-blur-xl transition hover:bg-cyan-300/[.09] hover:text-cyan-50" aria-label="Samuel Desktop"><MonitorSmartphone className="size-[16px]" /></Link>
          {alerts > 0 && <button type="button" onClick={() => onNavigate("executive-inbox")} className="relative flex size-10 items-center justify-center rounded-full border border-white/[.08] bg-black/20 text-white/55 backdrop-blur-xl" aria-label="Alertas"><Bell className="size-[16px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-300" /></button>}
          <button type="button" onClick={() => onNavigate("dashboard")} className="flex size-10 items-center justify-center rounded-full border border-white/[.08] bg-black/20 text-white/55 backdrop-blur-xl transition hover:bg-white/[.07] hover:text-white" aria-label="Abrir sistema"><Grid2X2 className="size-[16px]" /></button>
        </div>
      </header>

      <div className="absolute inset-0 z-10 pt-16">
        <ChatPanel
          key={data.executiveContext?.company.id ?? "default-company"}
          initialMessages={EMPTY_CHAT_MESSAGES}
          companyId={data.executiveContext?.company.id ?? "default-company"}
          isProcessing={handlers.isProcessing}
          onSendMessage={handlers.onSendMessage}
          onFirstMessage={handlers.onFirstMessage}
        />
      </div>
    </section>
  );
}
