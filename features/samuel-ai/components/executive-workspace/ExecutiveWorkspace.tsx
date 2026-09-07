"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Menu,
  MessageSquareText,
  Sparkles,
  WandSparkles,
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
  const samuelMode = activeSection === "samuel-ai";

  /* Samuel is deliberately isolated from the management dashboard. Mixing the
     dashboard chrome with the voice assistant was the main UX failure. */
  if (samuelMode) {
    return (
      <div className="h-dvh w-full overflow-hidden bg-[#030507]">
        <ExecutiveWorkspaceCenter activeSection={activeSection} onSectionChange={setActiveSection} {...workspaceData} {...handlers} />
      </div>
    );
  }

  return (
    <div className="samuel-shell relative flex min-h-dvh flex-col overflow-x-hidden bg-[#f4f7fc] text-[#0b1f4f] xl:h-dvh xl:overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-12%,rgba(37,99,235,0.14),transparent_58%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]" />
      <header className="samuel-topbar relative z-30 shrink-0 border-b border-blue-950/[0.07] bg-white/85 shadow-[0_1px_24px_rgba(15,45,100,.04)] backdrop-blur-2xl">
        <div className="flex min-h-[74px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Abrir menu" className="rounded-xl border border-blue-950/10 bg-blue-50 p-2.5 text-blue-800 lg:hidden" onClick={() => setMobileMenuOpen(true)}><Menu className="size-5" /></button>
            <div className="samuel-brand-mark hidden sm:flex"><BrainCircuit className="size-5" /></div>
            <div><div className="flex items-center gap-2"><h1 className="text-base font-semibold tracking-[0.18em] text-[#081b48] sm:text-lg">SAMUEL</h1><span className="rounded-md border border-blue-300/50 bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-700">AI</span></div><p className="text-[9px] uppercase tracking-[0.24em] text-blue-950/45">Executive Operating System</p></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-blue-950/[0.08] bg-blue-50/70 px-4 py-2 lg:flex"><Sparkles className="size-3.5 text-blue-600" /><span className="text-[11px] text-blue-950/55">{getWorkspaceSectionLabel(activeSection)}</span></div>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Abrir Executive Inbox" onClick={() => setActiveSection("executive-inbox")} className="relative flex size-10 items-center justify-center rounded-xl border border-blue-950/10 bg-white text-blue-900/60"><Bell className="size-[18px]" />{hasNotifications && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-400" />}</button>
            <div className="hidden items-center gap-2 rounded-xl border border-blue-950/10 bg-white px-2.5 py-1.5 sm:flex"><BriefcaseBusiness className="size-4 text-blue-700" /><p className="max-w-32 truncate text-[10px] font-medium text-blue-950">{workspaceData.executiveContext?.company.name ?? "A sua empresa"}</p></div>
          </div>
        </div>
      </header>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row xl:overflow-hidden">
        <ExecutiveSidebar activeSection={activeSection} onSectionChange={setActiveSection} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        <main className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-3 pb-24 sm:p-5 lg:p-6 lg:pb-6", "xl:flex-row")}>
          <ExecutiveWorkspaceCenter activeSection={activeSection} onSectionChange={setActiveSection} {...workspaceData} {...handlers} />
          {activeSection !== "dashboard" && activeSection !== "studio" && <div className="hidden shrink-0 xl:block xl:overflow-y-auto"><ExecutiveWorkspaceRightPanel {...workspaceData} /></div>}
        </main>
      </div>
      <MobileCommandBar activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

function MobileCommandBar({ activeSection, onSectionChange }: { activeSection: WorkspaceSection; onSectionChange: (section: WorkspaceSection) => void }) {
  const items = [
    { section: "dashboard" as WorkspaceSection, label: "Início", icon: LayoutDashboard },
    { section: "executive-inbox" as WorkspaceSection, label: "Inbox", icon: Inbox },
    { section: "samuel-ai" as WorkspaceSection, label: "Samuel", icon: MessageSquareText, primary: true },
    { section: "executive-tasks" as WorkspaceSection, label: "Tarefas", icon: ListTodo },
    { section: "studio" as WorkspaceSection, label: "Studio", icon: WandSparkles },
  ];
  return <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[22px] border border-blue-950/10 bg-white/92 px-2 py-2 shadow-xl backdrop-blur-2xl lg:hidden">{items.map((item) => { const active = activeSection === item.section; return <button key={item.section} type="button" onClick={() => onSectionChange(item.section)} className={cn("relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[8px] font-medium", active ? "text-blue-700" : "text-blue-950/40", item.primary && "mx-auto -mt-7 size-[62px] min-h-0 rounded-full bg-[#07152d] text-cyan-100 shadow-[0_0_28px_rgba(37,99,235,.45)]")}><item.icon className={item.primary ? "size-6" : "size-[18px]"} />{!item.primary && <span>{item.label}</span>}</button>; })}</nav>;
}
