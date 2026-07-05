"use client";

import { useMemo, useState } from "react";

import { SectionHeader } from "@/features/samuel-ai/components/section-header";

import {
  buildExecutiveAlertCenter,
  filterExecutiveAlerts,
  type BuildExecutiveAlertCenterInput,
} from "./build-executive-alert-center";
import { ExecutiveAlertCard } from "./ExecutiveAlertCard";
import { ExecutiveAlertFilters } from "./ExecutiveAlertFilters";
import { ExecutiveAlertSummary } from "./ExecutiveAlertSummary";
import type {
  ConsolidatedExecutiveAlert,
  ExecutiveAlertFilter,
  ExecutiveAlertStatus,
} from "./executive-alert-center.types";

export type ExecutiveAlertCenterProps = BuildExecutiveAlertCenterInput;

export function ExecutiveAlertCenter(props: ExecutiveAlertCenterProps) {
  const [activeFilter, setActiveFilter] = useState<ExecutiveAlertFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ExecutiveAlertStatus>>({});

  const { alerts: baseAlerts, summary } = useMemo(
    () => buildExecutiveAlertCenter(props),
    [props],
  );

  const alerts = useMemo(
    () =>
      baseAlerts.map((alert) => ({
        ...alert,
        status: statusOverrides[alert.id] ?? alert.status,
      })),
    [baseAlerts, statusOverrides],
  );

  const filteredAlerts = useMemo(
    () => filterExecutiveAlerts(alerts, activeFilter),
    [alerts, activeFilter],
  );

  const filterCounts = useMemo(() => {
    const counts: Partial<Record<ExecutiveAlertFilter, number>> = {
      all: alerts.length,
      critical: filterExecutiveAlerts(alerts, "critical").length,
      today: filterExecutiveAlerts(alerts, "today").length,
      "this-week": filterExecutiveAlerts(alerts, "this-week").length,
      marketing: filterExecutiveAlerts(alerts, "marketing").length,
      finance: filterExecutiveAlerts(alerts, "finance").length,
      operations: filterExecutiveAlerts(alerts, "operations").length,
      seo: filterExecutiveAlerts(alerts, "seo").length,
      market: filterExecutiveAlerts(alerts, "market").length,
    };
    return counts;
  }, [alerts]);

  const resolvedCount = alerts.filter((alert) => alert.status === "resolved").length;

  const updateStatus = (id: string, status: ExecutiveAlertStatus) => {
    setStatusOverrides((current) => ({ ...current, [id]: status }));
  };

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Alert Center"
        description="Central consolidada de alertas executivos em tempo real"
      />

      <ExecutiveAlertSummary summary={summary} resolvedOverride={resolvedCount} />

      <ExecutiveAlertFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          {filteredAlerts.length} alerta(s) · filtro: {activeFilter}
        </p>
        <ul className="flex max-h-[480px] flex-col gap-1.5 overflow-y-auto pr-1">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertCardWithActions
                key={alert.id}
                alert={alert}
                expanded={expandedId === alert.id}
                onToggleDetails={() =>
                  setExpandedId((current) => (current === alert.id ? null : alert.id))
                }
                onDelegate={() => updateStatus(alert.id, "delegated")}
                onResolve={() => updateStatus(alert.id, "resolved")}
                onAddToAgenda={() => updateStatus(alert.id, "agenda")}
              />
            ))
          ) : (
            <li className="rounded-lg border border-border/60 bg-black/10 px-3 py-4 text-center text-sm text-muted">
              Nenhum alerta para o filtro selecionado.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

function AlertCardWithActions({
  alert,
  expanded,
  onToggleDetails,
  onDelegate,
  onResolve,
  onAddToAgenda,
}: {
  alert: ConsolidatedExecutiveAlert;
  expanded: boolean;
  onToggleDetails: () => void;
  onDelegate: () => void;
  onResolve: () => void;
  onAddToAgenda: () => void;
}) {
  return (
    <ExecutiveAlertCard
      alert={alert}
      expanded={expanded}
      onToggleDetails={onToggleDetails}
      onDelegate={onDelegate}
      onResolve={onResolve}
      onAddToAgenda={onAddToAgenda}
    />
  );
}
