"use client";

import Link from "next/link";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Inbox,
  MonitorSmartphone,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { cn } from "@/utils/cn";
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

const NAV_ITEMS = [
  { section: "samuel-ai" as WorkspaceSection, label: "Samuel", icon: Sparkles },
  { section: "executive-inbox" as WorkspaceSection, label: "Work", icon: Inbox },
  { section: "dashboard" as WorkspaceSection, label: "Growth", icon: BarChart3 },
  { section: "studio" as WorkspaceSection, label: "Studio", icon: WandSparkles },
  { section: "crm" as WorkspaceSection, label: "Clients", icon: BriefcaseBusiness },
];

export function SamuelAiFocus({ data, handlers, onNavigate }: SamuelAiFocusProps) {
  const companyName = data.executiveContext?.company.name ?? data.briefing.companyName ?? "SF Growth AI";
  const segment = data.executiveContext?.businessProfile?.segment ?? data.executiveContext?.company.industry ?? null;
  const alerts = (data.watcherExecutive?.summary.criticalAlerts ?? 0) + (data.executiveMonitoring?.alerts.length ?? 0);
  const status = handlers.isProcessing ? "executando" : data.pendingQuestion ? "pensando" : "online";

  return (
    <section className="samuel-focus-cockpit samuel-command-center relative h-dvh w-full overflow-hidden bg-[#030507] text-white">
      <AmbientParticleField />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_48%_at_50%_16%,rgba(33,104,255,.14),transparent_62%),radial-gradient(circle_at_50%_58%,rgba(34,211,238,.045),transparent_28%),linear-gradient(180deg,#04070a_0%,#020305_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[14%] size-[42vw] max-h-[620px] max-w-[620px] -translate-x-1/2 rounded-full border border-cyan-200/[.035] shadow-[0_0_120px_rgba(34,211,238,.035),inset_0_0_90px_rgba(37,99,235,.025)]" />

      <header className="absolute inset-x-0 top-0 z-[90] flex h-20 items-center justify-between gap-4 px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/10 bg-cyan-300/[.045] text-cyan-100/80 shadow-[0_0_28px_rgba(34,211,238,.07)]">
            <Sparkles className="size-[17px]" />
            <span className={cn("absolute -right-0.5 -top-0.5 size-2 rounded-full border border-[#030507]", handlers.isProcessing ? "animate-pulse bg-cyan-300" : "bg-emerald-300")} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-white/82">SF Growth AI</p>
            <p className="mt-0.5 max-w-40 truncate text-[8px] uppercase tracking-[.14em] text-white/25">{companyName}</p>
          </div>
        </div>

        <nav className="absolute left-1/2 top-4 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/[.065] bg-black/25 p-1.5 shadow-[0_14px_40px_rgba(0,0,0,.20)] backdrop-blur-2xl md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.section}
              type="button"
              onClick={() => onNavigate(item.section)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-[9px] font-medium transition",
                item.section === "samuel-ai"
                  ? "bg-white/[.075] text-cyan-50"
                  : "text-white/34 hover:bg-white/[.04] hover:text-white/68",
              )}
            >
              <item.icon className="size-3.5" strokeWidth={1.6} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {alerts > 0 && (
            <button type="button" onClick={() => onNavigate("executive-inbox")} className="relative flex size-10 items-center justify-center rounded-xl border border-white/[.07] bg-white/[.025] text-white/45 backdrop-blur-xl transition hover:bg-white/[.06] hover:text-white" aria-label="Abrir alertas">
              <Bell className="size-[16px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-300" />
            </button>
          )}
          <Link href="/samuel-ai/desktop" className="flex items-center gap-2 rounded-xl border border-cyan-200/10 bg-cyan-300/[.04] px-3 py-2.5 text-[9px] font-medium text-cyan-50/55 backdrop-blur-xl transition hover:bg-cyan-300/[.08] hover:text-cyan-50" aria-label="Samuel Desktop">
            <MonitorSmartphone className="size-[15px]" />
            <span className="hidden sm:inline">Desktop</span>
          </Link>
        </div>
      </header>

      <aside className="pointer-events-none absolute left-6 top-1/2 z-40 hidden w-52 -translate-y-1/2 xl:block">
        <div className="rounded-[22px] border border-white/[.055] bg-black/18 p-4 shadow-[0_20px_70px_rgba(0,0,0,.18)] backdrop-blur-2xl">
          <p className="text-[8px] font-semibold uppercase tracking-[.22em] text-white/22">Now</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={cn("size-2 rounded-full", handlers.isProcessing ? "animate-pulse bg-cyan-300" : "bg-emerald-300")} />
            <strong className="text-[11px] font-medium capitalize text-white/72">{status}</strong>
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-white/28">
            {handlers.isProcessing
              ? "Samuel está coordenando a execução e validando o próximo passo."
              : "Pronto para receber uma intenção e escolher as capacidades necessárias."}
          </p>
          {data.pendingQuestion && (
            <div className="mt-3 border-t border-white/[.05] pt-3">
              <p className="line-clamp-3 text-[9px] leading-relaxed text-cyan-50/45">“{data.pendingQuestion}”</p>
            </div>
          )}
        </div>
      </aside>

      <aside className="pointer-events-none absolute right-6 top-1/2 z-40 hidden w-52 -translate-y-1/2 xl:block">
        <div className="rounded-[22px] border border-white/[.055] bg-black/18 p-4 shadow-[0_20px_70px_rgba(0,0,0,.18)] backdrop-blur-2xl">
          <p className="text-[8px] font-semibold uppercase tracking-[.22em] text-white/22">Context</p>
          <p className="mt-3 truncate text-[11px] font-medium text-white/68">{companyName}</p>
          {segment && <p className="mt-1 truncate text-[9px] text-white/28">{segment}</p>}
          <div className="mt-4 space-y-2 border-t border-white/[.05] pt-3 text-[9px] text-white/28">
            <div className="flex items-center justify-between"><span>Business Twin</span><span className={data.executiveContext ? "text-emerald-200/60" : "text-white/20"}>{data.executiveContext ? "sync" : "sem contexto"}</span></div>
            <div className="flex items-center justify-between"><span>Monitorização</span><span className={(data.executiveMonitoring || data.watcherExecutive) ? "text-emerald-200/60" : "text-white/20"}>{(data.executiveMonitoring || data.watcherExecutive) ? "ativa" : "inativa"}</span></div>
            {alerts > 0 && <div className="flex items-center justify-between"><span>Alertas</span><span className="text-amber-200/70">{alerts}</span></div>}
          </div>
        </div>
      </aside>

      <div className="absolute inset-0 z-10 pt-20">
        <ChatPanel
          key={data.executiveContext?.company.id ?? "default-company"}
          initialMessages={EMPTY_CHAT_MESSAGES}
          companyId={data.executiveContext?.company.id ?? "default-company"}
          isProcessing={handlers.isProcessing}
          onSendMessage={handlers.onSendMessage}
          onFirstMessage={handlers.onFirstMessage}
        />
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[85] hidden -translate-x-1/2 text-center md:block">
        <p className="text-[7px] uppercase tracking-[.18em] text-white/14">Intenção → coordenação → execução → verificação</p>
      </div>
    </section>
  );
}
