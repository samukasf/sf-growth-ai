"use client";

import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  CalendarDays,
  Globe2,
  Inbox,
  ListTodo,
  Radar,
  WandSparkles,
} from "lucide-react";

import { ChatPanel } from "../chat-panel";
import { AmbientParticleField } from "../shared/ambient-particle-field";
import type {
  ExecutiveWorkspaceData,
  ExecutiveWorkspaceHandlers,
} from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";

const EMPTY_CHAT_MESSAGES: [] = [];

type SamuelAiFocusProps = {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
};

type Shortcut = {
  section: WorkspaceSection;
  label: string;
  icon: LucideIcon;
};

const SHORTCUTS: Shortcut[] = [
  { section: "executive-inbox", label: "Inbox", icon: Inbox },
  { section: "executive-agenda", label: "Agenda", icon: CalendarDays },
  { section: "executive-tasks", label: "Tarefas", icon: ListTodo },
  { section: "executive-watchers", label: "Radar", icon: Radar },
  { section: "site-builder", label: "Sites", icon: Globe2 },
  { section: "studio", label: "Studio", icon: WandSparkles },
  { section: "autonomous-improvement", label: "Evolução", icon: BrainCircuit },
];

export function SamuelAiFocus({ data, handlers, onNavigate }: SamuelAiFocusProps) {
  const companyName = data.executiveContext?.company.name ?? data.briefing.companyName ?? "SF Growth AI";
  const criticalAlerts = data.watcherExecutive?.summary.criticalAlerts ?? 0;
  const monitoringAlerts = data.executiveMonitoring?.alerts.length ?? 0;
  const hasAttention = criticalAlerts + monitoringAlerts > 0;
  const status = handlers.isProcessing ? "Pensando" : "Pronto";

  return (
    <div className="samuel-focus-cockpit relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#050607] text-white">
      <AmbientParticleField />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,.055),transparent_28%),linear-gradient(180deg,rgba(255,255,255,.014),transparent_28%)]" />

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/[.07] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-[.28em] text-white/30">SF Growth AI</p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold tracking-[-.01em] text-white/90">Samuel</h1>
            <span className="truncate text-[10px] text-white/30">· {companyName}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasAttention && (
            <button
              type="button"
              onClick={() => onNavigate("executive-inbox")}
              className="relative flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[.045] text-white/55 transition hover:bg-white/[.08] hover:text-white"
              aria-label="Abrir itens que precisam de atenção"
            >
              <Inbox className="size-3.5" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,.85)]" />
            </button>
          )}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[10px] text-white/50">
            <span className={`size-1.5 rounded-full ${handlers.isProcessing ? "animate-pulse bg-white" : "bg-emerald-300"}`} />
            {status}
          </span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <ChatPanel
            key={data.executiveContext?.company.id ?? "default-company"}
            initialMessages={EMPTY_CHAT_MESSAGES}
            companyId={data.executiveContext?.company.id ?? "default-company"}
            isProcessing={handlers.isProcessing}
            onSendMessage={handlers.onSendMessage}
            onFirstMessage={handlers.onFirstMessage}
          />
        </div>

        <nav className="samuel-focus-shortcuts relative z-30 shrink-0 border-t border-white/[.07] bg-black/45 px-2 py-2 backdrop-blur-2xl sm:px-4" aria-label="Atalhos do Samuel">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SHORTCUTS.map((shortcut) => (
              <button
                key={shortcut.section}
                type="button"
                onClick={() => onNavigate(shortcut.section)}
                className="group flex min-w-[58px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-white/35 transition hover:bg-white/[.055] hover:text-white/80 sm:min-w-[72px]"
              >
                <shortcut.icon className="size-4" strokeWidth={1.5} />
                <span className="text-[9px] font-medium">{shortcut.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
