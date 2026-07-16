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

import {
  applyInboxActionsToCeo,
  applyInboxActionsToMonitoring,
} from "@/features/executive-inbox";
import {
  hydrateExecutiveInboxActions,
  loadExecutiveInboxActions,
  persistExecutiveInboxAction,
} from "@/features/executive-inbox/services/executive-inbox-persistence.service";
import { captureKnowledgeFromInboxAction } from "@/features/executive-knowledge";
import { syncInboxActionToExecutiveMemory } from "@/features/executive-memory-engine";
import type { ExecutiveInboxActionRecord } from "@/features/executive-inbox/executive-inbox.types";
import type { ExecutiveInboxItem, InboxActionType } from "@/features/executive-inbox/executive-inbox.types";

import { ExecutiveSidebar } from "./ExecutiveSidebar";
import { ExecutiveWorkspaceCenter } from "./ExecutiveWorkspaceCenter";
import { ExecutiveWorkspaceRightPanel } from "./ExecutiveWorkspaceRightPanel";
import type {
  ExecutiveWorkspaceData,
  ExecutiveWorkspaceHandlers,
} from "./executive-workspace.types";

import { getWorkspaceSectionLabel, type WorkspaceSection } from "./workspace-navigation";

export type ExecutiveWorkspaceProps = ExecutiveWorkspaceData & ExecutiveWorkspaceHandlers;

export function ExecutiveWorkspace({
  onSendMessage,
  onFirstMessage,
  isProcessing,
  ...data
}: ExecutiveWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const companyId = data.executiveContext?.company.id ?? "default-company";
  const [inboxActions, setInboxActions] = useState<ExecutiveInboxActionRecord[]>(() =>
    loadExecutiveInboxActions(companyId),
  );

  useEffect(() => {
    const controller = new AbortController();
    void hydrateExecutiveInboxActions(companyId, controller.signal).then((remote) => {
      if (controller.signal.aborted) return;
      setInboxActions(remote);
    });

    return () => controller.abort();
  }, [companyId]);

  const handleInboxAction = useCallback(
    async (item: ExecutiveInboxItem, action: InboxActionType) => {
      const nextActions = await persistExecutiveInboxAction(
        companyId,
        item,
        action,
        inboxActions,
      );
      setInboxActions(nextActions);
      void captureKnowledgeFromInboxAction(companyId, item, action);
      void syncInboxActionToExecutiveMemory(companyId, item, action);
    },
    [companyId, inboxActions],
  );

  const workspaceData = useMemo(() => {
    const executiveMonitoring = data.executiveMonitoring
      ? applyInboxActionsToMonitoring(data.executiveMonitoring, inboxActions)
      : data.executiveMonitoring;

    const executiveCeo = data.executiveCeo
      ? applyInboxActionsToCeo(data.executiveCeo, inboxActions)
      : data.executiveCeo;

    return {
      ...data,
      executiveMonitoring,
      executiveCeo,
    };
  }, [data, inboxActions]);

  const hasNotifications =
    (workspaceData.executiveMonitoring?.alerts.length ?? 0) > 0 ||
    (workspaceData.watcherExecutive?.summary.criticalAlerts ?? 0) > 0;

  const handlers: ExecutiveWorkspaceHandlers = {
    onSendMessage,
    onFirstMessage,
    isProcessing,
    inboxActions,
    onInboxAction: handleInboxAction,
  };

  return (
    <div className="samuel-shell relative flex min-h-dvh flex-col overflow-x-hidden bg-[#f4f7fc] text-[#0b1f4f] xl:h-dvh xl:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-12%,rgba(37,99,235,0.14),transparent_58%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(37,99,235,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.035)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <header className="samuel-topbar relative z-30 shrink-0 border-b border-blue-950/[0.07] bg-white/85 shadow-[0_1px_24px_rgba(15,45,100,.04)] backdrop-blur-2xl">
        <div className="flex min-h-[74px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="rounded-xl border border-blue-950/10 bg-blue-50 p-2.5 text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-100 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <div className="samuel-brand-mark hidden sm:flex" aria-hidden="true">
              <BrainCircuit className="size-5" strokeWidth={1.7} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-[0.18em] text-[#081b48] sm:text-lg">SAMUEL</h1>
                <span className="rounded-md border border-blue-300/50 bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-blue-700">AI</span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.24em] text-blue-950/45">Executive Operating System</p>
            </div>
          </div>

          <div className="hidden min-w-0 items-center gap-2 rounded-full border border-blue-950/[0.08] bg-blue-50/70 px-4 py-2 lg:flex">
            <Sparkles className="size-3.5 text-blue-600" />
            <span className="max-w-[260px] truncate text-[11px] text-blue-950/55">
              {getWorkspaceSectionLabel(activeSection)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 md:flex">
              <span aria-hidden="true" className="size-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-300">Samuel online</span>
            </div>
            <button
              type="button"
              aria-label="Abrir Executive Inbox"
              onClick={() => setActiveSection("executive-inbox")}
              className="relative flex size-10 items-center justify-center rounded-xl border border-blue-950/10 bg-white text-blue-900/60 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
            >
              <Bell className="size-[18px]" strokeWidth={1.7} />
              {hasNotifications && (
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,.8)]" />
              )}
            </button>
            <div className="hidden items-center gap-2 rounded-xl border border-blue-950/10 bg-white px-2.5 py-1.5 shadow-sm sm:flex">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-violet-500/20 text-blue-200">
                <BriefcaseBusiness className="size-3.5" />
              </span>
              <div className="max-w-32">
                <p className="truncate text-[10px] font-medium text-blue-950">{workspaceData.executiveContext?.company.name ?? "A sua empresa"}</p>
                <p className="text-[8px] text-blue-950/40">Company Brain</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row xl:overflow-hidden">
        <ExecutiveSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-3 pb-24 sm:p-5 sm:pb-24 lg:p-6 lg:pb-6",
            "xl:flex-row",
          )}
        >
          <ExecutiveWorkspaceCenter
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            {...workspaceData}
            {...handlers}
          />

          {activeSection !== "dashboard" && activeSection !== "studio" && (
            <div className="hidden shrink-0 xl:block xl:overflow-y-auto">
              <ExecutiveWorkspaceRightPanel {...workspaceData} />
            </div>
          )}
        </main>
      </div>

      <MobileCommandBar activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

function MobileCommandBar({
  activeSection,
  onSectionChange,
}: {
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
}) {
  const items: Array<{
    section: WorkspaceSection;
    label: string;
    icon: typeof LayoutDashboard;
    primary?: boolean;
  }> = [
    { section: "dashboard", label: "Início", icon: LayoutDashboard },
    { section: "executive-inbox", label: "Inbox", icon: Inbox },
    { section: "samuel-ai", label: "Samuel", icon: MessageSquareText, primary: true },
    { section: "executive-tasks", label: "Tarefas", icon: ListTodo },
    { section: "studio", label: "Studio", icon: WandSparkles },
  ];

  return (
    <nav className="samuel-mobile-bar fixed inset-x-3 z-40 grid grid-cols-5 rounded-[22px] border border-blue-950/10 bg-white/92 px-2 py-2 shadow-[0_18px_55px_rgba(15,45,100,.2)] backdrop-blur-2xl lg:hidden">
      {items.map((item) => {
        const active = activeSection === item.section;
        return (
          <button
            key={item.section}
            type="button"
            onClick={() => onSectionChange(item.section)}
            className={cn(
              "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[8px] font-medium transition",
              active ? "text-blue-700" : "text-blue-950/40 hover:text-blue-700",
              item.primary && "mx-auto -mt-7 size-[62px] min-h-0 rounded-full border border-cyan-300/25 bg-[radial-gradient(circle_at_50%_35%,#2563eb,#0b1d48_62%,#020617)] text-cyan-100 shadow-[0_0_28px_rgba(37,99,235,.55)]",
            )}
          >
            <item.icon className={cn(item.primary ? "size-6" : "size-[18px]")} strokeWidth={item.primary ? 1.5 : 1.8} />
            {!item.primary && <span>{item.label}</span>}
            {active && !item.primary && <span className="absolute bottom-0.5 size-1 rounded-full bg-blue-400" />}
          </button>
        );
      })}
    </nav>
  );
}
