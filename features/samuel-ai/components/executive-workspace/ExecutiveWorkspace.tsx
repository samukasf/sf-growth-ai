"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

  const handlers: ExecutiveWorkspaceHandlers = {
    onSendMessage,
    onFirstMessage,
    isProcessing,
    inboxActions,
    onInboxAction: handleInboxAction,
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#020617] xl:h-dvh">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_55%_-10%,rgba(34,211,238,0.20),transparent_58%),radial-gradient(ellipse_60%_45%_at_95%_20%,rgba(168,85,247,0.15),transparent_55%),linear-gradient(135deg,#020617_0%,#02030a_52%,#07031a_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.025)_1px,transparent_1px)] bg-[size:44px_44px]"
      />

      <header className="relative z-30 shrink-0 border-b border-cyan-300/[0.08] bg-[#020617]/70 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="rounded-lg border border-border bg-white/[0.03] p-2 text-muted transition-colors hover:text-foreground lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </button>
            <div className="hidden size-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 shadow-[0_0_28px_rgba(34,211,238,0.16)] sm:flex">
              <span className="text-xs font-bold tracking-wider text-cyan-200">SA</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                SF Growth AI
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Samuel AI Command Center
              </h1>
              <p className="mt-0.5 text-xs text-muted">
                {getWorkspaceSectionLabel(activeSection)} · Executive Command Center
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex">
              <span aria-hidden="true" className="size-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-emerald-400">Samuel Online</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              <span className="text-[11px] text-muted">Memória sincronizada</span>
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
            "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-5 lg:p-6",
            "xl:flex-row",
          )}
        >
          <ExecutiveWorkspaceCenter
            activeSection={activeSection}
            {...workspaceData}
            {...handlers}
          />

          <div className="hidden shrink-0 xl:block xl:overflow-y-auto">
            <ExecutiveWorkspaceRightPanel {...workspaceData} />
          </div>
        </main>
      </div>

      <div className="border-t border-white/[0.06] bg-black/40 p-4 xl:hidden">
        <ExecutiveWorkspaceRightPanel {...workspaceData} />
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
