"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  BrainCircuit,
  Gauge,
  GitPullRequestArrow,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { cn } from "@/utils/cn";

import type { AutonomousImprovementReport } from "./autonomous-improvement.types";

type LoadState = "idle" | "loading" | "ready" | "error";

function severityClass(severity: string) {
  switch (severity) {
    case "critical":
      return "border-rose-300/50 bg-rose-50 text-rose-700";
    case "warning":
      return "border-amber-300/50 bg-amber-50 text-amber-700";
    case "healthy":
      return "border-emerald-300/50 bg-emerald-50 text-emerald-700";
    default:
      return "border-blue-300/50 bg-blue-50 text-blue-700";
  }
}

function priorityClass(priority: string) {
  switch (priority) {
    case "critical":
      return "bg-rose-500";
    case "high":
      return "bg-amber-400";
    case "medium":
      return "bg-blue-500";
    default:
      return "bg-slate-300";
  }
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof BrainCircuit;
}) {
  return (
    <div className="rounded-2xl border border-blue-950/10 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-950/45">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-blue-950">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="size-5" strokeWidth={1.7} />
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-blue-950/55">{detail}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-2xl border border-blue-950/10 bg-blue-50/70"
        />
      ))}
    </div>
  );
}

export function AutonomousImprovementPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [report, setReport] = useState<AutonomousImprovementReport | null>(null);

  const loadReport = useCallback(async (showLoading = true) => {
    if (showLoading) setState("loading");
    try {
      const response = await fetch("/api/samuel-ai/autonomous-improvement", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Não foi possível carregar o motor de autoevolução.");
      const payload = (await response.json()) as AutonomousImprovementReport;
      setReport(payload);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialReport() {
      try {
        const response = await fetch("/api/samuel-ai/autonomous-improvement", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Não foi possível carregar o motor de autoevolução.");
        const payload = (await response.json()) as AutonomousImprovementReport;
        if (!active) return;
        setReport(payload);
        setState("ready");
      } catch {
        if (active) setState("error");
      }
    }

    void loadInitialReport();

    return () => {
      active = false;
    };
  }, []);

  const topSignals = useMemo(() => report?.signals.slice(0, 6) ?? [], [report]);
  const backlog = useMemo(() => report?.backlog.slice(0, 5) ?? [], [report]);

  if (state === "loading" || state === "idle") {
    return (
      <section className="flex flex-col gap-4">
        <div className="rounded-3xl border border-blue-950/10 bg-white/80 p-5">
          <p className="text-sm font-semibold text-blue-950">A carregar autoevolução do Samuel…</p>
        </div>
        <Skeleton />
      </section>
    );
  }

  if (state === "error" || !report) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
        <p className="font-semibold">Não consegui carregar o motor de autoevolução agora.</p>
        <button
          type="button"
          onClick={() => void loadReport()}
          className="mt-3 rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-[28px] border border-blue-950/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.18),transparent_35%),linear-gradient(135deg,#ffffff,#eef6ff)] p-5 shadow-[0_20px_70px_rgba(15,45,100,.08)]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/50 bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
              <Sparkles className="size-3.5" />
              Samuel Autonomy Engine
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
              Motor multiagente de melhoria contínua
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-blue-950/60">
              O Samuel agora coordena um catálogo interno com {report.agentCatalog.totalAgents} agentes
              especializados, inspirado no Ruflo, para detectar gargalos, priorizar melhorias e criar planos
              seguros de evolução contínua.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadReport()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-300/60 bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:border-blue-500 hover:text-blue-800"
          >
            <Radar className="size-4" />
            Atualizar diagnóstico
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Agentes ativos"
            value={`${report.agentCatalog.activeAgents}`}
            detail="Especialistas por domínio com rota de trabalho e saída auditável."
            icon={Bot}
          />
          <MetricCard
            label="Velocidade"
            value={`${report.performance.parallelizationPotential}%`}
            detail="Potencial de paralelização para análise, QA, integrações e operação."
            icon={Zap}
          />
          <MetricCard
            label="Inteligência"
            value={report.intelligence.expectedResponseMode === "local_fallback" ? "Fallback" : "IA ativa"}
            detail={report.intelligence.providerConfigured ? "Provider de IA ligado." : "Provider de IA ainda pendente."}
            icon={BrainCircuit}
          />
          <MetricCard
            label="Segurança"
            value={report.loop.writeMode === "pull_request" ? "PR" : "Planos"}
            detail="Nada altera produção sem plano, testes e revisão humana quando necessário."
            icon={ShieldCheck}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-blue-950/10 bg-white/85 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-950/40">
                Sinais reais
              </p>
              <h3 className="mt-1 text-lg font-semibold text-blue-950">Diagnóstico contínuo</h3>
            </div>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
              {report.loop.cadence}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {topSignals.map((signal) => (
              <article
                key={signal.id}
                className={cn("rounded-2xl border p-4", severityClass(signal.severity))}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{signal.title}</p>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-semibold uppercase">
                    {signal.severity}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed opacity-80">{signal.detail}</p>
                <p className="mt-3 text-[10px] font-medium opacity-70">{signal.source}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-blue-950/10 bg-[#061b49] p-5 text-white shadow-[0_20px_65px_rgba(6,27,73,.18)]">
            <div className="flex items-center gap-2">
              <GitPullRequestArrow className="size-5 text-cyan-200" />
              <p className="text-sm font-semibold">Ruflo Bridge</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-blue-100/75">
              Repositório:{" "}
              <a
                href={report.sourceRepository.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cyan-200 underline-offset-4 hover:underline"
              >
                {report.sourceRepository.name}
              </a>
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/70">
                Modo de integração
              </p>
              <p className="mt-1 text-sm font-semibold">
                {report.sourceRepository.integrationMode === "bridge"
                  ? "Bridge externo configurado"
                  : "Catálogo interno seguro"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-950/10 bg-white/85 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-950">Próximas melhorias</h3>
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {backlog.map((item) => (
                <li key={item.id} className="rounded-2xl border border-blue-950/10 bg-blue-50/50 p-3">
                  <div className="flex items-start gap-2">
                    <span className={cn("mt-1 size-2 rounded-full", priorityClass(item.priority))} />
                    <div>
                      <p className="text-xs font-semibold text-blue-950">{item.title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-blue-950/55">{item.outcome}</p>
                      <p className="mt-2 text-[10px] text-blue-700/80">
                        {item.canRunAutomatically ? "Automatizável" : "Requer PR/revisão"} · {item.effort}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
