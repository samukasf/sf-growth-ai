"use client";

import { useState } from "react";

import { cn } from "@/utils/cn";

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
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("executive-inbox");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(59,130,246,0.12),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_30%)]"
      />

      <header className="relative z-30 shrink-0 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
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
            <div className="hidden size-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 sm:flex">
              <span className="text-xs font-bold tracking-wider text-accent">ECC</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                SF Growth AI
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Executive Workspace
              </h1>
              <p className="mt-0.5 text-xs text-muted">
                {getWorkspaceSectionLabel(activeSection)} · Executive Command Center
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex">
              <span aria-hidden="true" className="size-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-emerald-400">Sistema operacional</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              <span className="text-[11px] text-muted">Demonstração</span>
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
            onSendMessage={onSendMessage}
            onFirstMessage={onFirstMessage}
            isProcessing={isProcessing}
            {...data}
          />

          <div className="hidden shrink-0 xl:block xl:overflow-y-auto">
            <ExecutiveWorkspaceRightPanel {...data} />
          </div>
        </main>
      </div>

      <div className="border-t border-white/[0.06] bg-black/40 p-4 xl:hidden">
        <ExecutiveWorkspaceRightPanel {...data} />
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
