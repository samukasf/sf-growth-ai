"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BarChart3,
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
import { ExecutiveWorkspaceRightPanel } from "./ExecutiveWorkspaceRightPanel";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import { getWorkspaceSectionLabel, type WorkspaceSection } from "./workspace-navigation";

export type ExecutiveWorkspaceProps = ExecutiveWorkspaceData & ExecutiveWorkspaceHandlers;

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

  const handlers: ExecutiveWorkspaceHandlers = { onSendMessage, onFirstMessage, isProcessing, inboxActions, onInboxAction: handleInboxAction };
  const hasNotifications = (workspaceData.executiveMonitoring?.alerts.length ?? 0) > 0 || (workspaceData.watcherExecutive?.summary.criticalAlerts ?? 0) > 0;

  if (activeSection === "samuel-ai") {
    return (
      <div className="h-dvh w-full overflow-hidden bg-[#030507]">
        <ExecutiveWorkspaceCenter activeSection={activeSection} onSectionChange={setActiveSection} {...workspaceData} {...handlers} />
      </div>
    );
  }

  const fullWidthSection = activeSection === "dashboard" || activeSection === "studio" || activeSection === "executive-alerts";

  return (
    <div className="samuel-shell relative flex min-h-dvh flex-col overflow-x-hidden bg-[#040910] text-white xl:h-dvh xl:overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_42%_at_50%_-8%,rgba(42,119,255,.14),transparent_62%),radial-gradient(circle_at_86%_18%,rgba(34,211,238,.05),transparent_26%),linear-gradient(180deg,#06111c_0%,#03070c_100%)]" />

      <header className="relative z-30 shrink-0 border-b border-cyan-300/[.08] bg-[#04101a]/88 backdrop-blur-2xl">
        <div className="flex min-h-[72px] items-center justify-between gap-3 px-3 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Abrir menu" className="rounded-xl border border-white/[.08] bg-white/[.035] p-2.5 text-white/70 lg:hidden" onClick={() => setMobileMenuOpen(true)}><Menu className="size-5" /></button>
            <button type="button" onClick={() => setActiveSection("samuel-ai")} className="hidden size-10 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[.05] text-cyan-100 transition hover:bg-cyan-300/[.10] sm:flex" aria-label="Voltar ao início"><BrainCircuit className="size-4" /></button>
            <div className="min-w-0">
              <div className="flex items-center gap-2"><h1 className="truncate text-[11px] font-semibold tracking-[0.18em] text-white/88">SAMUEL IA</h1><span className="size-1.5 rounded-full bg-emerald-300" /></div>
              <p className="mt-0.5 truncate text-[8px] uppercase tracking-[0.16em] text-white/32">{getWorkspaceSectionLabel(activeSection)}</p>
            </div>
          </div>

          <div className="hidden rounded-full border border-white/[.06] bg-white/[.025] px-4 py-2 xl:block"><p className="max-w-[220px] truncate text-[9px] font-medium tracking-[.06em] text-white/38">{workspaceData.executiveContext?.company.name ?? "A sua empresa"}</p></div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setActiveSection("samuel-ai")} className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 text-[10px] text-white/58 transition hover:bg-white/[.06] hover:text-white md:flex"><Home className="size-4" />Início</button>
            <button type="button" onClick={() => setActiveSection("studio")} className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 text-[10px] font-semibold transition ${activeSection === "studio" ? "border-cyan-300/40 bg-cyan-300/[.12] text-cyan-50" : "border-cyan-300/15 bg-cyan-300/[.055] text-cyan-100/80 hover:bg-cyan-300/[.10]"}`}><Film className="size-4" /><span className="hidden sm:inline">Vídeos e Redes</span><span className="sm:hidden">Vídeos</span></button>
            <button type="button" aria-label="Abrir alertas" onClick={() => setActiveSection("executive-alerts")} className={`relative flex size-10 items-center justify-center rounded-xl border transition ${activeSection === "executive-alerts" ? "border-amber-300/30 bg-amber-300/[.08] text-amber-100" : "border-white/[.07] bg-white/[.03] text-white/50 hover:bg-white/[.06] hover:text-white"}`}><Bell className="size-[17px]" />{hasNotifications && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,.7)]" />}</button>
            <button type="button" onClick={() => setActiveSection("samuel-ai")} className="hidden items-center gap-2 rounded-xl border border-cyan-200/10 bg-cyan-300/[.05] px-3.5 py-2.5 text-[10px] font-medium text-cyan-50/72 transition hover:bg-cyan-300/[.09] lg:flex"><MessageSquareText className="size-4" />Falar com Samuel</button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row xl:overflow-hidden">
        <ExecutiveSidebar activeSection={activeSection} onSectionChange={setActiveSection} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        <main className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-2 pb-24 sm:p-4 lg:pb-4", !fullWidthSection && "xl:flex-row")}>
          <div className={`min-w-0 flex-1 overflow-y-auto rounded-[24px] border border-cyan-300/[.07] bg-[#06101a]/68 shadow-[0_20px_70px_rgba(0,0,0,.24)] ${fullWidthSection ? "p-0" : "p-3 sm:p-4"}`}>
            <ExecutiveWorkspaceCenter activeSection={activeSection} onSectionChange={setActiveSection} {...workspaceData} {...handlers} />
          </div>
          {!fullWidthSection && <div className="hidden shrink-0 xl:block xl:overflow-y-auto"><ExecutiveWorkspaceRightPanel {...workspaceData} /></div>}
        </main>
      </div>
      <MobileCommandBar activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

function MobileCommandBar({ activeSection, onSectionChange }: { activeSection: WorkspaceSection; onSectionChange: (section: WorkspaceSection) => void }) {
  const items = [
    { section: "samuel-ai" as WorkspaceSection, label: "Início", icon: Home },
    { section: "executive-alerts" as WorkspaceSection, label: "Alertas", icon: Bell },
    { section: "studio" as WorkspaceSection, label: "Vídeos", icon: Film, primary: true },
    { section: "executive-inbox" as WorkspaceSection, label: "Tarefas", icon: Inbox },
    { section: "crm" as WorkspaceSection, label: "Clientes", icon: BriefcaseBusiness },
  ];
  return <nav className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-[22px] border border-cyan-300/[.10] bg-[#06111c]/94 px-2 py-2 shadow-2xl backdrop-blur-2xl lg:hidden">{items.map((item) => { const active = activeSection === item.section; return <button key={item.section} type="button" onClick={() => onSectionChange(item.section)} className={cn("relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[8px] font-medium transition", active ? "text-cyan-100" : "text-white/36", item.primary && "mx-auto -mt-7 size-[62px] min-h-0 rounded-full border border-cyan-200/20 bg-[radial-gradient(circle_at_38%_30%,#155e75,#0f2744_58%,#05070b)] text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,.22)]")}><item.icon className={item.primary ? "size-6" : "size-[18px]"} />{!item.primary && <span>{item.label}</span>}</button>; })}</nav>;
}
