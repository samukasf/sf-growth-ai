"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  Film,
  Home,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react";

import {
  buildExecutiveAlertCenter,
  filterExecutiveAlerts,
  type BuildExecutiveAlertCenterInput,
} from "./build-executive-alert-center";
import type {
  ExecutiveAlertFilter,
  ExecutiveAlertSeverity,
  ExecutiveAlertStatus,
} from "./executive-alert-center.types";

export type ExecutiveAlertCenterProps = BuildExecutiveAlertCenterInput;

const FILTERS: Array<{ id: ExecutiveAlertFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "critical", label: "Críticos" },
  { id: "today", label: "Hoje" },
  { id: "this-week", label: "Esta semana" },
  { id: "marketing", label: "Marketing" },
  { id: "finance", label: "Financeiro" },
  { id: "operations", label: "Operações" },
  { id: "seo", label: "SEO" },
  { id: "market", label: "Mercado" },
];

function severityClasses(severity: ExecutiveAlertSeverity) {
  if (severity === "Critical") return "border-red-400/25 bg-red-400/[.055] text-red-200";
  if (severity === "High") return "border-amber-300/25 bg-amber-300/[.055] text-amber-100";
  if (severity === "Medium") return "border-cyan-300/20 bg-cyan-300/[.045] text-cyan-100";
  return "border-white/10 bg-white/[.025] text-white/60";
}

export function ExecutiveAlertCenter(props: ExecutiveAlertCenterProps) {
  const [activeFilter, setActiveFilter] = useState<ExecutiveAlertFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ExecutiveAlertStatus>>({});

  const built = useMemo(() => buildExecutiveAlertCenter(props), [props]);
  const alerts = useMemo(
    () => built.alerts.map((alert) => ({ ...alert, status: statusOverrides[alert.id] ?? alert.status })),
    [built.alerts, statusOverrides],
  );
  const visible = useMemo(() => filterExecutiveAlerts(alerts, activeFilter), [alerts, activeFilter]);
  const critical = alerts.filter((item) => item.severity === "Critical" && item.status !== "resolved").length;
  const resolved = alerts.filter((item) => item.status === "resolved").length;

  const setStatus = (id: string, status: ExecutiveAlertStatus) =>
    setStatusOverrides((current) => ({ ...current, [id]: status }));

  return (
    <section className="min-h-full rounded-[26px] bg-[radial-gradient(circle_at_80%_0%,rgba(0,137,255,.10),transparent_28%),linear-gradient(180deg,#07121e,#03080e)] p-4 text-white sm:p-6">
      <header className="flex flex-col gap-4 border-b border-cyan-300/10 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.07] text-cyan-200">
            <BellRing className="size-5" />
          </span>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-cyan-200/55">Central de atenção</p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Alertas executivos</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-white/45">Priorize o que exige ação. Detalhes avançados ficam recolhidos para a tela continuar simples.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.location.assign("/samuel-ai")} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-4 text-xs text-white/75 transition hover:bg-white/[.07]"><Home className="size-4" />Início</button>
          <button type="button" onClick={() => window.dispatchEvent(new Event("samuel-open-content-studio"))} className="flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[.075] px-4 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-300/[.12]"><Film className="size-4" />Vídeos e Redes</button>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={ShieldAlert} label="Críticos ativos" value={critical} accent="text-red-300" />
        <Metric icon={BellRing} label="Total de alertas" value={alerts.length} accent="text-cyan-200" />
        <Metric icon={CheckCircle2} label="Resolvidos" value={resolved} accent="text-emerald-300" />
        <Metric icon={AlertTriangle} label="Risco geral" value={`${built.summary.riskScore}/100`} accent="text-amber-200" />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((filter) => {
          const count = filterExecutiveAlerts(alerts, filter.id).length;
          const active = activeFilter === filter.id;
          return (
            <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)} className={`min-h-10 shrink-0 rounded-xl border px-3 text-[11px] transition ${active ? "border-cyan-300/40 bg-cyan-300/[.10] text-cyan-50" : "border-white/[.07] bg-white/[.02] text-white/45 hover:text-white/75"}`}>
              {filter.label} <span className="ml-1 text-white/35">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-2">
        {visible.length ? visible.map((alert) => {
          const expanded = expandedId === alert.id;
          return (
            <article key={alert.id} className={`overflow-hidden rounded-2xl border transition ${severityClasses(alert.severity)}`}>
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-white">{alert.title}</strong>
                    <span className="rounded-full border border-current/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">{alert.severity}</span>
                    {alert.status !== "active" && <span className="rounded-full bg-white/[.06] px-2 py-0.5 text-[9px] uppercase text-white/45">{alert.status}</span>}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/58">{alert.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-white/32"><span>{alert.originLabel}</span><span>{alert.responsible}</span><span>Confiança {alert.confidence}%</span></div>
                </div>
                <button type="button" onClick={() => setExpandedId(expanded ? null : alert.id)} className="flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 text-[10px] text-white/60 hover:text-white">{expanded ? "Ocultar" : "Ver detalhes"}<ChevronDown className={`size-3 transition ${expanded ? "rotate-180" : ""}`} /></button>
              </div>

              {expanded && (
                <div className="border-t border-white/[.07] bg-black/15 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white/[.06] bg-black/10 p-3"><span className="text-[9px] uppercase tracking-wider text-white/30">Impacto</span><p className="mt-1 text-xs leading-5 text-white/65">{alert.impact}</p></div>
                    <div className="rounded-xl border border-white/[.06] bg-black/10 p-3"><span className="text-[9px] uppercase tracking-wider text-white/30">Recomendação</span><p className="mt-1 text-xs leading-5 text-white/65">{alert.recommendation}</p></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setStatus(alert.id, "delegated")} className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-[10px] text-white/65 hover:bg-white/[.04]"><UserRoundCheck className="size-3.5" />Delegar</button>
                    <button type="button" onClick={() => setStatus(alert.id, "agenda")} className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-[10px] text-white/65 hover:bg-white/[.04]"><CalendarPlus className="size-3.5" />Adicionar à agenda</button>
                    <button type="button" onClick={() => setStatus(alert.id, "resolved")} className="flex min-h-10 items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[.05] px-3 text-[10px] text-emerald-100 hover:bg-emerald-300/[.10]"><CheckCircle2 className="size-3.5" />Marcar resolvido</button>
                  </div>
                </div>
              )}
            </article>
          );
        }) : <div className="rounded-2xl border border-white/[.07] bg-white/[.02] p-8 text-center text-sm text-white/40">Nenhum alerta neste filtro.</div>}
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: typeof BellRing; label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/[.07] bg-black/20 p-4">
      <div className="flex items-center justify-between gap-2"><span className="text-[9px] uppercase tracking-[.14em] text-white/30">{label}</span><Icon className={`size-4 ${accent}`} /></div>
      <strong className={`mt-3 block text-2xl ${accent}`}>{value}</strong>
    </div>
  );
}
