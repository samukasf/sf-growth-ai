"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Gauge,
  Lightbulb,
  Megaphone,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
  Workflow,
  Zap,
} from "lucide-react";

import { buildExecutiveInbox } from "@/features/executive-inbox";
import { cn } from "@/utils/cn";

import type {
  ExecutiveWorkspaceData,
  ExecutiveWorkspaceHandlers,
} from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";

type SamuelExecutiveHomeProps = {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
};

type QuickModule = {
  label: string;
  description: string;
  section: WorkspaceSection;
  icon: LucideIcon;
  tone: "blue" | "cyan" | "violet" | "emerald" | "amber";
};

const QUICK_MODULES: QuickModule[] = [
  {
    label: "Conversar",
    description: "Decida com o Samuel",
    section: "samuel-ai",
    icon: MessageSquareText,
    tone: "blue",
  },
  {
    label: "Anúncios",
    description: "Campanhas e resultados",
    section: "meta",
    icon: Megaphone,
    tone: "violet",
  },
  {
    label: "Postagens",
    description: "Criar e agendar conteúdo",
    section: "marketing",
    icon: Sparkles,
    tone: "cyan",
  },
  {
    label: "Relatórios",
    description: "Análises e insights",
    section: "google-analytics",
    icon: BarChart3,
    tone: "emerald",
  },
  {
    label: "Automações",
    description: "Fluxos e processos",
    section: "operations",
    icon: Workflow,
    tone: "amber",
  },
];

const HEALTH_LABELS = {
  excellent: "Excelente",
  good: "Saudável",
  fair: "Atenção",
  critical: "Crítica",
} as const;

const HEALTH_COPY = {
  excellent: "A empresa está a operar com sinais fortes de crescimento.",
  good: "A empresa mantém uma base saudável e oportunidades abertas.",
  fair: "Existem pontos que precisam de decisão e acompanhamento.",
  critical: "O sistema detetou riscos que exigem intervenção prioritária.",
} as const;

const TONE_STYLES: Record<QuickModule["tone"], string> = {
  blue: "border-blue-400/20 bg-blue-500/10 text-blue-300",
  cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
  violet: "border-violet-400/20 bg-violet-500/10 text-violet-300",
  emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
};

function scoreStatus(score: number) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Saudável";
  if (score >= 40) return "Atenção";
  return "Crítico";
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: QuickModule["tone"];
}) {
  return (
    <article className="group rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-white/[0.055]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl border",
            TONE_STYLES[tone],
          )}
        >
          <Icon className="size-4" strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-2 truncate text-[11px] text-slate-500">{detail}</p>
    </article>
  );
}

function ScoreRing({ score }: { score: number }) {
  const normalized = Math.max(0, Math.min(100, score));
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="relative mx-auto size-36">
      <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148,163,184,.12)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeLinecap="round"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tracking-tight text-white">{normalized}</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">de 100</span>
      </div>
    </div>
  );
}

function SamuelHologram({ active }: { active: boolean }) {
  return (
    <div className={cn("samuel-hologram", active && "samuel-hologram--active")} aria-hidden="true">
      <div className="samuel-hologram__aura" />
      <svg viewBox="0 0 520 440" role="presentation" className="samuel-hologram__svg">
        <defs>
          <radialGradient id="samuel-core" cx="50%" cy="44%" r="58%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity=".88" />
            <stop offset="36%" stopColor="#2563eb" stopOpacity=".46" />
            <stop offset="72%" stopColor="#172554" stopOpacity=".16" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="samuel-body" x1="50%" y1="0" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity=".8" />
            <stop offset="55%" stopColor="#2563eb" stopOpacity=".32" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="samuel-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="samuel-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="samuel-grid" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M18 0H0V18" fill="none" stroke="#38bdf8" strokeOpacity=".13" strokeWidth=".6" />
          </pattern>
          <clipPath id="samuel-bust-clip">
            <path d="M121 438c9-86 42-122 101-139l10-38h56l10 38c59 17 92 53 101 139Z" />
            <ellipse cx="260" cy="190" rx="82" ry="112" />
          </clipPath>
        </defs>

        <circle cx="260" cy="202" r="171" fill="url(#samuel-core)" />
        <g className="samuel-hologram__rings" fill="none" stroke="#38bdf8">
          <circle cx="260" cy="202" r="162" strokeOpacity=".18" strokeWidth="1" strokeDasharray="2 10" />
          <circle cx="260" cy="202" r="137" strokeOpacity=".28" strokeWidth="1" strokeDasharray="28 8 4 8" />
          <circle cx="260" cy="202" r="113" strokeOpacity=".24" strokeWidth=".8" strokeDasharray="3 7" />
        </g>
        <g className="samuel-hologram__orbit" fill="#67e8f9">
          <circle cx="260" cy="40" r="3" />
          <circle cx="397" cy="286" r="2.5" />
          <circle cx="117" cy="130" r="2" />
        </g>

        <path
          d="M121 438c9-86 42-122 101-139l10-38h56l10 38c59 17 92 53 101 139Z"
          fill="url(#samuel-body)"
          stroke="url(#samuel-line)"
          strokeOpacity=".72"
          strokeWidth="1.5"
        />
        <ellipse
          cx="260"
          cy="190"
          rx="82"
          ry="112"
          fill="#0b1d48"
          fillOpacity=".72"
          stroke="url(#samuel-line)"
          strokeWidth="2"
          filter="url(#samuel-glow)"
        />
        <g clipPath="url(#samuel-bust-clip)">
          <rect x="100" y="70" width="320" height="368" fill="url(#samuel-grid)" />
          <g stroke="#7dd3fc" strokeOpacity=".48" strokeWidth=".8">
            <path d="M178 181h45l18 15h38l18-15h45" />
            <path d="M260 78v65l-15 38 15 28 16-28" />
            <path d="M205 260l55 20 55-20" />
            <path d="M151 364l109 36 109-36" />
            <path d="M194 317l66 34 66-34" />
          </g>
        </g>

        <g fill="none" stroke="url(#samuel-line)" strokeLinecap="round" filter="url(#samuel-glow)">
          <path d="M211 177c15-10 31-9 43 0" strokeWidth="3" />
          <path d="M266 177c12-9 29-10 43 0" strokeWidth="3" />
          <path d="M229 232c20 13 42 13 62 0" strokeWidth="2" strokeOpacity=".82" />
          <path d="M260 185v30" strokeWidth="1.4" strokeOpacity=".72" />
        </g>
        <g fill="#a5f3fc" filter="url(#samuel-glow)">
          <circle cx="232" cy="178" r="3.5" />
          <circle cx="288" cy="178" r="3.5" />
          <circle cx="260" cy="143" r="3" />
          <circle cx="260" cy="280" r="3" />
          <circle cx="194" cy="317" r="2" />
          <circle cx="326" cy="317" r="2" />
        </g>
        <path d="M100 420h320" stroke="#38bdf8" strokeOpacity=".35" strokeDasharray="2 8" />
        <path className="samuel-hologram__scan" d="M126 192h268" stroke="#a5f3fc" strokeWidth="1.5" filter="url(#samuel-glow)" />
      </svg>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-blue-300 transition hover:text-cyan-200"
        >
          {action.label}
          <ArrowRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function IntegrationItem({
  label,
  connected,
  icon: Icon,
}: {
  label: string;
  connected: boolean;
  icon: LucideIcon;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.035]">
      <span className="flex size-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-slate-300">
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-200">{label}</p>
        <p className={cn("text-[10px]", connected ? "text-emerald-400" : "text-slate-600")}>
          {connected ? "Módulo ativo" : "Aguardando ligação"}
        </p>
      </div>
      {connected ? (
        <CheckCircle2 className="size-4 text-emerald-400" />
      ) : (
        <span className="size-2 rounded-full bg-slate-700" />
      )}
    </li>
  );
}

export function SamuelExecutiveHome({
  data,
  handlers,
  onNavigate,
}: SamuelExecutiveHomeProps) {
  const companyName = data.executiveContext?.company.name ?? data.briefing.companyName ?? "A sua empresa";
  const companyHealth = data.executiveCeo?.companyHealth;
  const healthScore = companyHealth?.score ?? data.executiveCeo?.executiveScore ?? 0;
  const healthStatus = companyHealth?.status ?? (healthScore >= 60 ? "good" : "fair");
  const inbox = buildExecutiveInbox({
    ...data,
    isProcessing: handlers.isProcessing,
    inboxActions: handlers.inboxActions,
  });
  const pendingTasks = data.executiveMonitoring?.progress.pendingTasks ?? inbox.summary.pendingCount;
  const urgentActions = inbox.summary.urgentCount;
  const onlineExecutives = data.council.members.filter((member) => member.status === "online").length;
  const priorities =
    data.executiveCeo?.topPriorities.length
      ? data.executiveCeo.topPriorities.slice(0, 4)
      : inbox.items.slice(0, 4).map((item) => item.title);
  const timeline = data.executiveMonitoring?.timeline.slice(0, 4) ?? [];
  const insight =
    data.executiveCeo?.executiveRecommendation ||
    data.briefing.nextRecommendation ||
    "Conecte o Company Brain para receber recomendações orientadas pelos dados da sua empresa.";

  const performance = [
    {
      label: "Receita",
      value: data.briefing.metrics.revenue.value,
      detail: data.briefing.metrics.revenue.change,
      icon: CircleDollarSign,
      tone: "emerald" as const,
    },
    {
      label: "Leads",
      value: data.briefing.metrics.leads.value,
      detail: data.briefing.metrics.leads.change,
      icon: UsersRound,
      tone: "cyan" as const,
    },
    {
      label: "Conversões",
      value: data.briefing.metrics.conversions.value,
      detail: data.briefing.metrics.conversions.change,
      icon: TrendingUp,
      tone: "violet" as const,
    },
    {
      label: "Execução",
      value: `${data.executiveMonitoring?.progress.overall ?? 0}%`,
      detail: `${data.executiveMonitoring?.progress.activePlans ?? 0} planos ativos`,
      icon: Activity,
      tone: "blue" as const,
    },
  ];

  return (
    <div className="samuel-home flex flex-col gap-5 pb-20 lg:pb-4">
      <section className="samuel-hero overflow-hidden rounded-[28px] border border-blue-300/15">
        <div className="samuel-hero__noise" aria-hidden="true" />
        <div className="samuel-hero__grid">
          <aside className="samuel-hero__score order-2 lg:order-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/80">
              Pontuação executiva
            </p>
            <ScoreRing score={healthScore} />
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-300">{HEALTH_LABELS[healthStatus]}</p>
              <p className="mx-auto mt-1 max-w-[210px] text-[11px] leading-relaxed text-slate-400">
                {companyHealth?.summary || HEALTH_COPY[healthStatus]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="mx-auto mt-4 flex items-center gap-1.5 text-[11px] font-medium text-blue-300 hover:text-cyan-200"
            >
              Ver diagnóstico <ArrowRight className="size-3.5" />
            </button>
          </aside>

          <div className="samuel-hero__center order-1 lg:order-2">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-1 flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/[0.07] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300">
                <span className={cn("size-1.5 rounded-full bg-emerald-300", handlers.isProcessing && "animate-pulse")} />
                {handlers.isProcessing ? "Samuel a analisar" : "Samuel online"}
              </div>
              {!data.executiveContext && (
                <span className="relative z-10 -mb-5 mt-2 rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-amber-200/80">
                  Dados de demonstração
                </span>
              )}
              <SamuelHologram active={handlers.isProcessing} />
              <div className="relative z-20 -mt-16 sm:-mt-20">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-300/80">
                  AI Executive Operating System
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Olá, Samuel.
                </h1>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                  Pronto para impulsionar o crescimento da {companyName} hoje?
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate("samuel-ai")}
                    className="samuel-primary-action group"
                  >
                    <span className="samuel-primary-action__wave" aria-hidden="true">
                      {[8, 15, 10, 22, 13, 26, 18, 11, 20, 9].map((height, index) => (
                        <i key={`${height}-${index}`} style={{ height }} />
                      ))}
                    </span>
                    Conversar com Samuel
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <Link
                    href="/empresas"
                    className="flex h-11 items-center gap-2 rounded-xl border border-blue-950/10 bg-white/80 px-4 text-xs font-semibold text-blue-950 shadow-sm transition hover:border-cyan-300/60 hover:bg-white"
                  >
                    <BrainCircuit className="size-4 text-cyan-300" />
                    Company Brain
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <aside className="samuel-hero__summary order-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/80">
              Resumo executivo
            </p>
            <ul className="mt-5 space-y-4">
              {[
                { label: "Itens na inbox", value: inbox.summary.totalItems, icon: BriefcaseBusiness, tone: "text-blue-300" },
                { label: "Tarefas pendentes", value: pendingTasks, icon: Clock3, tone: "text-amber-300" },
                { label: "Ações urgentes", value: urgentActions, icon: Zap, tone: "text-rose-300" },
                { label: "Executivos online", value: onlineExecutives, icon: Bot, tone: "text-cyan-300" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04]">
                    <item.icon className={cn("size-4", item.tone)} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-lg font-semibold leading-none text-white">{item.value}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{item.label}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onNavigate("executive-inbox")}
              className="mt-5 flex items-center gap-1.5 text-[11px] font-medium text-blue-300 hover:text-cyan-200"
            >
              Abrir Executive Inbox <ArrowRight className="size-3.5" />
            </button>
          </aside>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {QUICK_MODULES.map((module) => (
          <button
            key={module.label}
            type="button"
            onClick={() => onNavigate(module.section)}
            className="samuel-module-card group flex min-h-36 flex-col items-start rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1"
          >
            <span className={cn("flex size-11 items-center justify-center rounded-2xl border", TONE_STYLES[module.tone])}>
              <module.icon className="size-5" strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-sm font-semibold text-white">{module.label}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{module.description}</p>
            <span className="mt-auto self-end rounded-full border border-white/[0.08] p-1.5 text-slate-500 transition group-hover:border-blue-300/25 group-hover:text-blue-300">
              <ArrowRight className="size-3.5" />
            </span>
          </button>
        ))}
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
        <SectionTitle
          eyebrow={data.executiveContext ? "Desempenho geral" : "Desempenho geral · demonstração"}
          title="Sinais vitais da operação"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {performance.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_1.05fr_.9fr]">
        <article className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
          <SectionTitle
            eyebrow="Foco do dia"
            title="Prioridades executivas"
            action={{ label: "Ver tarefas", onClick: () => onNavigate("executive-tasks") }}
          />
          <ol className="space-y-2">
            {priorities.length > 0 ? (
              priorities.map((priority, index) => (
                <li key={`${priority}-${index}`} className="flex items-start gap-3 rounded-xl border border-white/[0.055] bg-black/15 px-3 py-3">
                  <span className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    index === 0 ? "bg-blue-400 text-slate-950" : "border border-white/10 bg-white/[0.04] text-slate-400",
                  )}>
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-relaxed text-slate-200">{priority}</p>
                    <p className="mt-1 text-[10px] text-slate-600">Prioridade {index === 0 ? "alta" : "executiva"}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-500">
                As prioridades surgirão após a primeira análise.
              </li>
            )}
          </ol>
        </article>

        <article className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
          <SectionTitle
            eyebrow="Plano executivo"
            title="Próximas ações"
            action={{ label: "Ver agenda", onClick: () => onNavigate("executive-agenda") }}
          />
          <div className="relative space-y-1 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-px before:bg-gradient-to-b before:from-blue-400/70 before:to-violet-400/10">
            {(timeline.length > 0 ? timeline : (data.executiveCeo?.nextActions ?? []).slice(0, 4).map((action, index) => ({
              id: `action-${index}`,
              label: action,
              deadline: index === 0 ? "Hoje" : "Próximo ciclo",
              status: "pending" as const,
            }))).map((item) => (
              <div key={item.id} className="relative flex gap-3 rounded-xl px-0 py-3 pl-0 transition hover:bg-white/[0.025]">
                <span className="relative z-10 mt-1 size-[23px] shrink-0 rounded-full border-4 border-[#080d19] bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,.55)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-relaxed text-slate-200">{item.label}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600">
                    <Clock3 className="size-3" />
                    <span>{item.deadline}</span>
                    <span>·</span>
                    <span className="capitalize">{item.status.replaceAll("_", " ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
          <SectionTitle
            eyebrow="Integrações"
            title="Ecossistema conectado"
            action={{ label: "Gerir", onClick: () => onNavigate("google-analytics") }}
          />
          <ul className="space-y-0.5">
            <IntegrationItem label="Google Analytics" connected={Boolean(data.googleAnalyticsExecutive)} icon={BarChart3} />
            <IntegrationItem label="Google Business" connected={Boolean(data.googleBusinessExecutive)} icon={BriefcaseBusiness} />
            <IntegrationItem label="Meta Ads" connected={Boolean(data.metaExecutive)} icon={Megaphone} />
            <IntegrationItem label="LinkedIn" connected={Boolean(data.linkedInExecutive)} icon={UsersRound} />
            <IntegrationItem label="Company Brain" connected={Boolean(data.executiveContext)} icon={BrainCircuit} />
          </ul>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <article className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(30,64,175,.16),rgba(8,47,73,.08),rgba(88,28,135,.12))] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,.12)]">
              <Lightbulb className="size-7" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Insight inteligente</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-100 sm:text-base">{insight}</p>
              <button
                type="button"
                onClick={() => onNavigate("samuel-ai")}
                className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100"
              >
                Analisar com Samuel <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Growth Score</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white">{data.executiveCeo?.growthScore ?? 0}</p>
              <p className="mt-1 text-xs text-emerald-300">{scoreStatus(data.executiveCeo?.growthScore ?? 0)}</p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-300">
              <Gauge className="size-5" />
            </span>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-400 transition-all duration-1000"
              style={{ width: `${data.executiveCeo?.growthScore ?? 0}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600">
            <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> Risco {data.executiveCeo?.riskScore ?? 0}</span>
            <span className="flex items-center gap-1"><Sparkles className="size-3" /> Oportunidade {data.executiveCeo?.opportunityScore ?? 0}</span>
          </div>
        </article>
      </section>
    </div>
  );
}
