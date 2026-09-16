"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Film,
  Home,
  Inbox,
  Menu,
  MessageSquareText,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { applyInboxActionsToCeo, applyInboxActionsToMonitoring } from "@/features/executive-inbox";
import { hydrateExecutiveInboxActions, loadExecutiveInboxActions, persistExecutiveInboxAction } from "@/features/executive-inbox/services/executive-inbox-persistence.service";
import { captureKnowledgeFromInboxAction } from "@/features/executive-knowledge";
import { syncInboxActionToExecutiveMemory } from "@/features/executive-memory-engine";
import type { ExecutiveInboxActionRecord, ExecutiveInboxItem, InboxActionType } from "@/features/executive-inbox/executive-inbox.types";
import { ExecutiveSidebar } from "./ExecutiveSidebar";
import { ExecutiveWorkspaceCenter } from "./ExecutiveWorkspaceCenter";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import { getWorkspaceSectionLabel, type WorkspaceSection } from "./workspace-navigation";

export type ExecutiveWorkspaceProps = ExecutiveWorkspaceData & ExecutiveWorkspaceHandlers;

const TOP_NAV: Array<{ id: WorkspaceSection; label: string; icon: typeof Home }> = [
  { id: "samuel-ai", label: "Início", icon: Home },
  { id: "studio", label: "Vídeos e Redes", icon: Film },
  { id: "executive-inbox", label: "Trabalho", icon: Inbox },
  { id: "dashboard", label: "Relatórios", icon: BarChart3 },
  { id: "crm", label: "Clientes", icon: BriefcaseBusiness },
];

export function ExecutiveWorkspace({ onSendMessage, onFirstMessage, isProcessing, ...data }: ExecutiveWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("samuel-ai");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const companyId = data.executiveContext?.company.id ?? "default-company";
  const [inboxActions, setInboxActions] = useState<ExecutiveInboxActionRecord[]>(() => loadExecutiveInboxActions(companyId));

  useEffect(() => {
    const controller = new AbortController();
    void hydrateExecutiveInboxActions(companyId, controller.signal).then((remote) => {
      if (!controller.signal.aborted) setInboxActions(remote);
    });
    return () => controller.abort();
  }, [companyId]);

  useEffect(() => {
    const openStudio = () => setActiveSection("studio");
    window.addEventListener("samuel-open-content-studio", openStudio);
    return () => window.removeEventListener("samuel-open-content-studio", openStudio);
  }, []);

  const handleInboxAction = useCallback(async (item: ExecutiveInboxItem, action: InboxActionType) => {
    const nextActions = await persistExecutiveInboxAction(companyId, item, action, inboxActions);
    setInboxActions(nextActions);
    void captureKnowledgeFromInboxAction(companyId, item, action);
    void syncInboxActionToExecutiveMemory(companyId, item, action);
  }, [companyId, inboxActions]);

  const workspaceData = useMemo(() => ({
    ...data,
    executiveMonitoring: data.executiveMonitoring ? applyInboxActionsToMonitoring(data.executiveMonitoring, inboxActions) : data.executiveMonitoring,
    executiveCeo: data.executiveCeo ? applyInboxActionsToCeo(data.executiveCeo, inboxActions) : data.executiveCeo,
  }), [data, inboxActions]);

  const handlers: ExecutiveWorkspaceHandlers = {
    onSendMessage,
    onFirstMessage,
    isProcessing,
    inboxActions,
    onInboxAction: handleInboxAction,
  };

  const alertCount =
    (workspaceData.executiveMonitoring?.alerts.length ?? 0) +
    (workspaceData.watcherExecutive?.summary.criticalAlerts ?? 0);

  if (activeSection === "samuel-ai") {
    return (
      <div className="h-dvh w-full overflow-hidden bg-[#030507]">
        <ExecutiveWorkspaceCenter activeSection={activeSection} onSectionChange={setActiveSection} {...workspaceData} {...handlers} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#02070c] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(0,128,255,.11),transparent_35%),linear-gradient(180deg,#07101a_0%,#02070c_100%)]" />

      <header className="relative z-30 shrink-0 border-b border-cyan-300/10 bg-[#030b13]/92 backdrop-blur-2xl">
        <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6">
          <button type="button" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)} className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.03] lg:hidden"><Menu className="size-5" /></button>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.05]"><BrainCircuit className="size-5 text-cyan-200" /></div>
            <div>
              <div className="text-xs font-semibold tracking-[.18em]">SF GROWTH AI</div>
              <div className="mt-1 text-[9px] uppercase tracking-[.18em] text-white/40">{getWorkspaceSectionLabel(activeSection)}</div>
            </div>
          </div>

          <nav className="ml-5 hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Navegação rápida">
            {TOP_NAV.map((item) => (
              <button key={item.id} type="button" onClick={() => setActiveSection(item.id)} className={cn("flex min-h-10 items-center gap-2 rounded-xl px-3 text-[11px] transition", activeSection === item.id ? "bg-cyan-400/10 text-cyan-100" : "text-white/45 hover:bg-white/[.04] hover:text-white")}>
                <item.icon className="size-4" />{item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setActiveSection("studio")} className="hidden min-h-10 items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 text-[11px] font-semibold text-cyan-50 sm:flex"><Film className="size-4" />Vídeos</button>
            <button type="button" aria-label="Abrir notificações" onClick={() => setActiveSection("executive-alerts")} className={cn("relative flex size-11 items-center justify-center rounded-xl border transition", activeSection === "executive-alerts" ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/[.03] text-white/60 hover:text-white")}>
              <Bell className="size-[18px]" />
              {alertCount > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{Math.min(alertCount, 9)}</span>}
            </button>
            <button type="button" onClick={() => setActiveSection("samuel-ai")} className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 text-[11px] text-white/70 sm:flex"><MessageSquareText className="size-4" />Samuel</button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <ExecutiveSidebar activeSection={activeSection} onSectionChange={setActiveSection} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        <main className="min-w-0 flex-1 overflow-y-auto p-3 pb-24 sm:p-5 lg:pb-5">
          <div className="mx-auto w-full max-w-[1500px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300/10 bg-[#07111c]/78 px-4 py-3 backdrop-blur-xl">
              <div>
                <p className="text-[9px] uppercase tracking-[.22em] text-cyan-200/55">Central de trabalho</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{getWorkspaceSectionLabel(activeSection)}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setActiveSection("studio")} className="min-h-10 rounded-xl border border-cyan-400/20 bg-cyan-400/[.08] px-3 text-[11px] text-cyan-100">Criar vídeo</button>
                <button type="button" onClick={() => setActiveSection("executive-alerts")} className="min-h-10 rounded-xl border border-white/10 bg-white/[.025] px-3 text-[11px] text-white/65">Alertas {alertCount ? `(${alertCount})` : ""}</button>
                <button type="button" onClick={() => setActiveSection("samuel-ai")} className="min-h-10 rounded-xl border border-white/10 bg-white/[.025] px-3 text-[11px] text-white/65">Voltar ao Samuel</button>
              </div>
            </div>
            <section className="min-h-[calc(100dvh-190px)] overflow-hidden rounded-[24px] border border-cyan-300/10 bg-[#050d16]/88 p-3 shadow-[0_20px_80px_rgba(0,0,0,.28)] sm:p-4">
              <ExecutiveWorkspaceCenter activeSection={activeSection} onSectionChange={setActiveSection} {...workspaceData} {...handlers} />
            </section>
          </div>
        </main>
      </div>

      <MobileCommandBar activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

function MobileCommandBar({ activeSection, onSectionChange }: { activeSection: WorkspaceSection; onSectionChange: (section: WorkspaceSection) => void }) {
  const items = [
    { section: "dashboard" as WorkspaceSection, label: "Relatórios", icon: BarChart3 },
    { section: "executive-alerts" as WorkspaceSection, label: "Alertas", icon: Bell },
    { section: "samuel-ai" as WorkspaceSection, label: "Samuel", icon: MessageSquareText, primary: true },
    { section: "studio" as WorkspaceSection, label: "Vídeos", icon: Film },
    { section: "crm" as WorkspaceSection, label: "Clientes", icon: BriefcaseBusiness },
  ];

  return (
    <nav className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-[22px] border border-white/10 bg-[#07111c]/96 p-2 shadow-2xl backdrop-blur-2xl lg:hidden">
      {items.map((item) => {
        const active = activeSection === item.section;
        return (
          <button key={item.section} type="button" onClick={() => onSectionChange(item.section)} className={cn("relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[8px] transition", active ? "text-cyan-100" : "text-white/40", item.primary && "mx-auto -mt-6 size-[58px] min-h-0 rounded-full border border-cyan-300/20 bg-[radial-gradient(circle,#155e75,#0f2744_58%,#05070b)] text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,.20)]")}>
            <item.icon className={item.primary ? "size-5" : "size-4"} />
            {!item.primary && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
