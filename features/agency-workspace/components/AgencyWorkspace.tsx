"use client";

import { useState } from "react";

import { cn } from "@/utils/cn";

import {
  AGENCY_WORKSPACE_NAV,
  getAgencySectionLabel,
  type AgencyWorkspaceSection,
} from "../navigation/workspace-navigation";
import { mergeClientIntoWorkspace } from "../services/save-client.service";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";
import type { ClientOnboardingResult } from "../types/client-onboarding.types";
import type { SaveClientResult } from "../types/new-client.types";
import { AgencyClientDetail } from "./AgencyClientDetail";
import { AgencyClientList } from "./AgencyClientList";
import { AgencyExecutivePanel } from "./AgencyExecutivePanel";
import { AgencyMissionPanel } from "./AgencyMissionPanel";
import { AgencyOpportunityPanel } from "./AgencyOpportunityPanel";
import { AgencyOverview } from "./AgencyOverview";
import { AgencyProjectPanel } from "./AgencyProjectPanel";
import { BusinessHealthPanel } from "./BusinessHealthPanel";
import { ClientOnboardingFlow } from "./ClientOnboardingFlow";

export type AgencyWorkspaceProps = {
  data: AgencyWorkspaceData;
};

export function AgencyWorkspace({ data: initialData }: AgencyWorkspaceProps) {
  const [workspaceData, setWorkspaceData] = useState(initialData);
  const [activeSection, setActiveSection] = useState<AgencyWorkspaceSection>("agency-overview");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    initialData.selectedClientId,
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [detailClientId, setDetailClientId] = useState<string | null>(null);
  const latestOnboarding: ClientOnboardingResult | null = null;

  const handleSaveClient = (result: SaveClientResult) => {
    setWorkspaceData((current) => mergeClientIntoWorkspace(current, result));
    setSelectedClientId(result.companyId);
    setShowOnboarding(false);
    setDetailClientId(null);
    setActiveSection("client-portfolio");
  };

  return (
    <div className="relative flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(59,130,246,0.12),transparent_55%)]"
      />

      <header className="relative z-30 shrink-0 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              SF Growth AI · ALPHA 01
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {workspaceData.agencyName}
            </h1>
            <p className="mt-0.5 text-xs text-muted">
              {getAgencySectionLabel(activeSection)} · Agency Executive Workspace
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
            <span aria-hidden="true" className="size-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-emerald-400">Integrado</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-white/[0.06] bg-black/20 lg:block">
          <nav className="flex flex-col gap-1 p-4">
            {AGENCY_WORKSPACE_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activeSection === item.id
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {showOnboarding ? (
            <ClientOnboardingFlow
              organizationId={workspaceData.organizationId}
              agencyId={workspaceData.agencyId}
              onSave={handleSaveClient}
              onCancel={() => setShowOnboarding(false)}
            />
          ) : null}

          {!showOnboarding && activeSection === "agency-overview" ? (
            <AgencyOverview data={workspaceData} latestOnboarding={latestOnboarding} />
          ) : null}
          {!showOnboarding && activeSection === "client-portfolio" && detailClientId ? (
            <AgencyClientDetail
              data={workspaceData}
              companyId={detailClientId}
              onBack={() => setDetailClientId(null)}
            />
          ) : null}
          {!showOnboarding && activeSection === "client-portfolio" && !detailClientId ? (
            <AgencyClientList
              data={workspaceData}
              onSelectClient={setDetailClientId}
              onNewClient={() => setShowOnboarding(true)}
            />
          ) : null}
          {!showOnboarding && activeSection === "company-brain" ? (
            <AgencyExecutivePanel data={workspaceData} variant="company-brain" />
          ) : null}
          {!showOnboarding && activeSection === "company-dashboard" ? (
            <AgencyExecutivePanel
              data={workspaceData}
              variant="company-dashboard"
              onboarding={latestOnboarding}
              selectedClientId={selectedClientId}
            />
          ) : null}
          {!showOnboarding && activeSection === "executive-dashboard" ? (
            <AgencyExecutivePanel data={workspaceData} variant="dashboard" />
          ) : null}
          {!showOnboarding && activeSection === "executive-council" ? (
            <AgencyExecutivePanel data={workspaceData} variant="council" />
          ) : null}
          {!showOnboarding && activeSection === "executive-ceo" ? (
            <AgencyExecutivePanel
              data={workspaceData}
              variant="ceo"
              onboarding={latestOnboarding}
            />
          ) : null}
          {!showOnboarding && activeSection === "projects" ? (
            <AgencyProjectPanel data={workspaceData} />
          ) : null}
          {!showOnboarding && activeSection === "missions" ? (
            <AgencyMissionPanel data={workspaceData} />
          ) : null}
          {!showOnboarding && activeSection === "opportunities" ? (
            <AgencyOpportunityPanel data={workspaceData} />
          ) : null}
          {!showOnboarding && activeSection === "business-health" ? (
            <BusinessHealthPanel data={workspaceData} onboarding={latestOnboarding} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
