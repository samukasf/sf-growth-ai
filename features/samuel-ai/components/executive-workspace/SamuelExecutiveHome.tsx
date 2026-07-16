"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Camera,
  CircleDollarSign,
  Clock3,
  Gauge,
  Megaphone,
  MessageSquareText,
  Music2,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  UsersRound,
  Volume2,
  VolumeX,
  Workflow,
  Zap,
} from "lucide-react";

import { buildExecutiveInbox } from "@/features/executive-inbox";
import { GoogleWorkspacePanel } from "@/features/google-workspace/GoogleWorkspacePanel";
import type { GoogleWorkspaceSummary } from "@/features/google-workspace/google-workspace.types";
import {
  buildProactiveSamuelGreeting,
  type SamuelInitiativeSignal,
} from "@/features/samuel-ai/proactive/proactive-samuel";
import { useSamuelSpeech } from "@/features/samuel-ai/voice/use-samuel-speech";
import { useSamuelIdlePresence } from "@/features/samuel-ai/voice/use-samuel-idle-presence";
import { cn } from "@/utils/cn";

import {
  SamuelHologram,
  type SamuelHologramState,
} from "../samuel-hologram";
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
    <div className="score-ring relative mx-auto size-36">
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

function ProactiveMessageText({
  text,
  active,
  wordIndex,
}: {
  text: string;
  active: boolean;
  wordIndex: number;
}) {
  if (!active) return text;
  let currentWord = -1;

  return text.split(/(\s+)/).map((part, index) => {
    if (/^\s+$/.test(part)) return part;
    currentWord += 1;
    return (
      <span
        key={`${index}-${part}`}
        className={cn(
          "samuel-proactive-card__word",
          currentWord < wordIndex && "is-complete",
          currentWord === wordIndex && "is-active",
        )}
      >
        {part}
      </span>
    );
  });
}

export function SamuelExecutiveHome({
  data,
  handlers,
  onNavigate,
}: SamuelExecutiveHomeProps) {
  const [googleWorkspaceSummary, setGoogleWorkspaceSummary] = useState<GoogleWorkspaceSummary | null>(null);
  const presenceSleeping = useSamuelIdlePresence();
  const [celebrating, setCelebrating] = useState(false);
  const lastCompletedAnalysisRef = useRef(data.analysisCompletedAt);
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
  const priorities = data.executiveCeo?.topPriorities.length
    ? data.executiveCeo.topPriorities.slice(0, 4)
    : inbox.items.slice(0, 4).map((item) => item.title);
  const timeline = data.executiveMonitoring?.timeline.slice(0, 4) ?? [];
  const insight =
    data.executiveCeo?.executiveRecommendation ||
    data.briefing.nextRecommendation ||
    "Conecte o Company Brain para receber recomendações orientadas pelos dados da sua empresa.";

  const performance = [
    {
      label: "Faturamento",
      value: data.briefing.metrics.revenue.value,
      detail: data.briefing.metrics.revenue.change,
      icon: CircleDollarSign,
      tone: "emerald" as const,
    },
    {
      label: "Crescimento",
      value: data.briefing.metrics.growth.value,
      detail: data.briefing.metrics.growth.change,
      icon: TrendingUp,
      tone: "blue" as const,
    },
    {
      label: "Leads gerados",
      value: data.briefing.metrics.leads.value,
      detail: data.briefing.metrics.leads.change,
      icon: UsersRound,
      tone: "cyan" as const,
    },
    {
      label: "Conversões",
      value: data.briefing.metrics.conversions.value,
      detail: data.briefing.metrics.conversions.change,
      icon: Activity,
      tone: "violet" as const,
    },
  ];

  const fallbackCampaigns = [
    { id: "google", name: "Google Ads", platform: "Google", roi: 0, status: data.googleAnalyticsExecutive ? "Monitorado" : "Aguardando dados" },
    { id: "meta", name: "Meta Ads", platform: "Meta", roi: data.metaExecutive?.roas ?? 0, status: data.metaExecutive ? "Monitorado" : "Aguardando dados" },
    { id: "linkedin", name: "LinkedIn Ads", platform: "LinkedIn", roi: 0, status: data.linkedInExecutive ? "Monitorado" : "Aguardando dados" },
  ];
  const campaigns = data.marketingExecutive?.campaignPerformance.length
    ? data.marketingExecutive.campaignPerformance.slice(0, 3)
    : fallbackCampaigns;

  const socialChannels = [
    { label: "Instagram", value: data.metaExecutive?.bestPerformingPosts.length ?? 0, icon: Camera, color: "text-fuchsia-600 bg-fuchsia-50" },
    { label: "Facebook", value: data.metaExecutive?.weakPerformingPosts.length ?? 0, icon: ThumbsUp, color: "text-blue-600 bg-blue-50" },
    { label: "LinkedIn", value: data.linkedInExecutive?.bestPosts.length ?? 0, icon: BriefcaseBusiness, color: "text-sky-700 bg-sky-50" },
    { label: "Conteúdo", value: data.marketingExecutive?.topChannels.length ?? 0, icon: Music2, color: "text-slate-900 bg-slate-100" },
  ];

  const calendarItems = timeline.length > 0
    ? timeline
    : (data.executiveCeo?.nextActions ?? []).slice(0, 4).map((action, index) => ({
        id: `calendar-action-${index}`,
        label: action,
        deadline: index === 0 ? "Hoje" : "Próximo ciclo",
        status: "pending" as const,
      }));

  const initiativeSignals: SamuelInitiativeSignal[] = [
    ...(data.executiveMonitoring?.alerts ?? []).map((alert) => ({
      id: `executive-alert-${alert.id}`,
      kind: "system" as const,
      priority: alert.severity,
      title: alert.title,
      detail: alert.message,
      source: "monitorização executiva",
      actionLabel: "Rever alerta",
    })),
    ...(data.marketingExecutive?.marketingRisks ?? []).slice(0, 3).map((risk) => ({
      id: `marketing-risk-${risk.id}`,
      kind: "campaign" as const,
      priority: risk.severity,
      title: risk.title,
      detail: risk.description,
      source: "Marketing Runtime",
      actionLabel: "Rever campanha",
    })),
  ];

  if (googleWorkspaceSummary?.connected) {
    const calendarCount = googleWorkspaceSummary.calendar.count ?? 0;
    const unreadCount = googleWorkspaceSummary.gmail.count ?? 0;

    if (calendarCount > 0) {
      initiativeSignals.push({
        id: `google-calendar-${calendarCount}`,
        kind: "calendar",
        priority: "high",
        title: `Sua agenda contém ${calendarCount} ${calendarCount === 1 ? "compromisso" : "compromissos"} hoje`,
        source: "Google Agenda",
        actionLabel: "Abrir agenda",
        occurredAt: googleWorkspaceSummary.updatedAt,
      });
    }

    if (unreadCount > 0) {
      initiativeSignals.push({
        id: `gmail-unread-${unreadCount}`,
        kind: "email",
        priority: unreadCount >= 10 ? "high" : "medium",
        title: `O Gmail possui ${unreadCount} ${unreadCount === 1 ? "mensagem não lida" : "mensagens não lidas"}`,
        source: "Gmail",
        actionLabel: "Rever e-mails",
        occurredAt: googleWorkspaceSummary.updatedAt,
      });
    }

    (["gmail", "calendar", "drive", "contacts"] as const).forEach((service) => {
      const status = googleWorkspaceSummary[service];
      if (!status.error) return;
      initiativeSignals.push({
        id: `google-error-${service}-${status.error}`,
        kind: "system",
        priority: "high",
        title: `A integração ${service} precisa de atenção`,
        detail: status.error,
        source: "Google Workspace",
        actionLabel: "Ver integração",
      });
    });
  }

  const proactiveGreeting = buildProactiveSamuelGreeting({
    companyName,
    urgentActions,
    pendingTasks,
    topPriority: priorities[0],
    signals: initiativeSignals,
  });
  const [proactiveVisible, setProactiveVisible] = useState(false);
  const [proactiveDismissed, setProactiveDismissed] = useState(false);
  const lastAutomaticSpeechRef = useRef(0);
  const {
    blocked: speechBlocked,
    cancel: cancelSpeech,
    mouthLevel: speechMouthLevel,
    progress: speechProgress,
    speak,
    speaking: samuelSpeaking,
    supported: speechSupported,
    wordIndex: speechWordIndex,
  } = useSamuelSpeech();

  const proactivePrefix = proactiveGreeting.spokenMessage.slice(
    0,
    proactiveGreeting.spokenMessage.indexOf(proactiveGreeting.message),
  );
  const proactiveWordOffset = proactivePrefix.trim()
    ? proactivePrefix.trim().split(/\s+/).length
    : 0;
  const homeHologramState: SamuelHologramState = samuelSpeaking
    ? "speaking"
    : handlers.isProcessing
      ? "executing"
      : celebrating
        ? "celebrating"
      : proactiveVisible && !proactiveDismissed && proactiveGreeting.visualState === "alert"
        ? "alert"
        : presenceSleeping
          ? "sleeping"
          : "resting";

  useEffect(() => {
    const completedAt = data.analysisCompletedAt;
    if (!completedAt || completedAt === lastCompletedAnalysisRef.current) return;
    lastCompletedAnalysisRef.current = completedAt;

    const startTimer = setTimeout(() => setCelebrating(true), 0);
    const endTimer = setTimeout(() => setCelebrating(false), 1_650);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [data.analysisCompletedAt]);

  function handleInitiativeAction() {
    switch (proactiveGreeting.signal?.kind) {
      case "calendar":
        onNavigate("executive-agenda");
        break;
      case "campaign":
        onNavigate("marketing");
        break;
      default:
        onNavigate("samuel-ai");
    }
  }

  useEffect(() => {
    const visualTimer = setTimeout(() => {
      setProactiveDismissed(false);
      setProactiveVisible(true);
    }, 550);
    const companyKey = data.executiveContext?.company.id ?? companyName;
    const dayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `sf-growth-ai:samuel-proactive:${companyKey}:${dayKey}:${proactiveGreeting.id}`;
    const speechTimer = setTimeout(() => {
      try {
        if (sessionStorage.getItem(storageKey)) return;
        sessionStorage.setItem(storageKey, "presented");
      } catch {
        // Browsers with private storage disabled can still receive the greeting.
      }
      if (Date.now() - lastAutomaticSpeechRef.current < 30_000) return;
      lastAutomaticSpeechRef.current = Date.now();
      speak(proactiveGreeting.spokenMessage, { automatic: true });
    }, 1_650);

    return () => {
      clearTimeout(visualTimer);
      clearTimeout(speechTimer);
      cancelSpeech();
    };
  }, [cancelSpeech, companyName, data.executiveContext?.company.id, proactiveGreeting.id, proactiveGreeting.spokenMessage, speak]);

  return (
    <div className="samuel-home flex flex-col gap-4 pb-20 lg:pb-4">
      <section className="samuel-hero overflow-hidden rounded-[28px] border border-blue-300/15">
        <div className="samuel-hero__noise" aria-hidden="true" />
        <div className="samuel-hero__grid">
          <aside className="samuel-hero__score">
            <p className="samuel-hero__card-title">Pontuação executiva</p>
            <ScoreRing score={healthScore} />
            <div className="text-center">
              <p className="samuel-hero__health-label">{HEALTH_LABELS[healthStatus]}</p>
              <p className="samuel-hero__health-copy">
                {companyHealth?.summary || HEALTH_COPY[healthStatus]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="samuel-hero__detail-link"
            >
              Ver detalhes <ArrowRight className="size-3" />
            </button>
          </aside>

          <div className="samuel-hero__center">
            <div className="relative z-10 flex h-full w-full flex-col items-center text-center">
              {!data.executiveContext && (
                <span className="samuel-demo-badge">Dados de demonstração</span>
              )}
              <SamuelHologram
                state={homeHologramState}
                audioLevel={speechMouthLevel}
                speechProgress={speechProgress}
              />
              {proactiveVisible && !proactiveDismissed && (
                <div
                  className={cn(
                    "samuel-proactive-card",
                    samuelSpeaking && "samuel-proactive-card--speaking",
                  )}
                  aria-live="polite"
                >
                  <button
                    type="button"
                    className="samuel-proactive-card__close"
                    onClick={() => {
                      setProactiveDismissed(true);
                      cancelSpeech();
                    }}
                    aria-label="Fechar saudação do Samuel"
                  >
                    ×
                  </button>
                  <div className="samuel-proactive-card__heading">
                    <span className="samuel-proactive-card__signal" aria-hidden="true" />
                    <p>{samuelSpeaking ? "Samuel está falando" : proactiveGreeting.eyebrow}</p>
                  </div>
                  <p className="samuel-proactive-card__source">
                    {proactiveGreeting.hasConcreteSignal ? "Sinal real" : "Estado atual"} · {proactiveGreeting.sourceLabel}
                  </p>
                  <p className="samuel-proactive-card__message">
                    <ProactiveMessageText
                      text={proactiveGreeting.message}
                      active={samuelSpeaking}
                      wordIndex={Math.max(-1, speechWordIndex - proactiveWordOffset)}
                    />
                  </p>
                  {speechBlocked && (
                    <p className="samuel-proactive-card__notice">
                      O celular bloqueou o áudio automático. Toque em “Ouvir Samuel”.
                    </p>
                  )}
                  <div className="samuel-proactive-card__actions">
                    <button type="button" onClick={handleInitiativeAction}>
                      <MessageSquareText aria-hidden="true" /> {proactiveGreeting.actionLabel ?? "Conversar agora"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (samuelSpeaking) cancelSpeech();
                        else speak(proactiveGreeting.spokenMessage);
                      }}
                      disabled={!speechSupported}
                    >
                      {samuelSpeaking ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
                      {samuelSpeaking
                        ? "Parar voz"
                        : speechSupported
                          ? "Ouvir Samuel"
                          : "Voz indisponível"}
                    </button>
                  </div>
                </div>
              )}
              <div className="samuel-hero__identity">
                <h1>Olá, Samuel! <span aria-hidden="true">👋</span></h1>
                <p>Pronto para impulsionar<br className="sm:hidden" /> o crescimento da {companyName} hoje?</p>
                <span className="samuel-online-badge">
                  <i className={cn((handlers.isProcessing || samuelSpeaking) && "animate-pulse")} />
                  {samuelSpeaking
                    ? "Samuel falando"
                    : handlers.isProcessing
                      ? "Samuel a analisar"
                      : "Samuel online"}
                </span>
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
                  Falar com Samuel
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>

          <aside className="samuel-hero__summary">
            <p className="samuel-hero__card-title">Resumo do dia</p>
            <ul>
              {[
                { label: "Itens na inbox", value: inbox.summary.totalItems, icon: BriefcaseBusiness, tone: "text-blue-600" },
                { label: "Tarefas pendentes", value: pendingTasks, icon: Clock3, tone: "text-amber-500" },
                { label: "Ações urgentes", value: urgentActions, icon: Zap, tone: "text-rose-500" },
                { label: "Executivos online", value: onlineExecutives, icon: Bot, tone: "text-cyan-600" },
              ].map((item) => (
                <li key={item.label}>
                  <span className="samuel-summary-icon">
                    <item.icon className={cn("size-4", item.tone)} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p>{item.value}</p>
                    <span>{item.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="samuel-modules-grid">
        {QUICK_MODULES.map((module) => (
          <button
            key={module.label}
            type="button"
            onClick={() => onNavigate(module.section)}
            className="samuel-module-card group"
          >
            <span className={cn("samuel-module-card__icon", TONE_STYLES[module.tone])}>
              <module.icon strokeWidth={1.7} />
            </span>
            <p>{module.label}</p>
            <span>{module.description}</span>
            <i>
              <ArrowRight className="size-3" />
            </i>
          </button>
        ))}
      </section>

      <section className="samuel-performance">
        <SectionTitle
          eyebrow={data.executiveContext ? "Desempenho geral" : "Desempenho geral · demonstração"}
          title="Sinais vitais da operação"
        />
        <div className="samuel-performance__grid">
          {performance.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
          <article className="samuel-ad-score">
            <div>
              <p>Pontuação de anúncios</p>
              <strong>{data.marketingExecutive?.paidMediaScore ?? 0}</strong>
              <span>{scoreStatus(data.marketingExecutive?.paidMediaScore ?? 0)}</span>
            </div>
            <Gauge className="size-6" />
          </article>
        </div>
      </section>

      <section className="samuel-dashboard-grid">
        <article className="samuel-dashboard-card">
          <SectionTitle
            eyebrow="Anúncios ativos"
            title="Campanhas"
            action={{ label: "Ver todas", onClick: () => onNavigate("meta") }}
          />
          <div className="samuel-campaign-list">
            {campaigns.map((campaign, index) => (
              <button key={campaign.id} type="button" onClick={() => onNavigate("meta")}>
                <span className={cn("samuel-campaign-logo", index === 0 ? "is-google" : index === 1 ? "is-meta" : "is-linkedin")}>
                  {index === 0 ? <Target /> : index === 1 ? <Megaphone /> : <BriefcaseBusiness />}
                </span>
                <span className="min-w-0 flex-1">
                  <strong>{campaign.name}</strong>
                  <small>{campaign.status}</small>
                </span>
                <span className="samuel-campaign-roi">
                  <small>ROI</small>
                  <b>{campaign.roi > 0 ? `${campaign.roi.toFixed(1)}x` : "—"}</b>
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="samuel-dashboard-card">
          <SectionTitle
            eyebrow="Postagens das redes"
            title="Canais sociais"
            action={{ label: "Ver todas", onClick: () => onNavigate("marketing") }}
          />
          <div className="samuel-social-grid">
            {socialChannels.map((channel) => (
              <button key={channel.label} type="button" onClick={() => onNavigate("marketing")}>
                <span className={channel.color}><channel.icon /></span>
                <strong>{channel.value}</strong>
                <small>{channel.label}</small>
              </button>
            ))}
          </div>
          <p className="samuel-card-subtitle">Próximas postagens</p>
          <div className="samuel-post-list">
            {(data.marketingExecutive?.marketingRecommendations.slice(0, 2) ?? priorities.slice(0, 2).map((title, index) => ({
              id: `post-${index}`,
              title,
              description: index === 0 ? "Instagram · Hoje, 10:00" : "LinkedIn · Amanhã, 09:30",
            }))).map((post) => (
              <button key={post.id} type="button" onClick={() => onNavigate("marketing")}>
                <span><Send className="size-3.5" /></span>
                <span className="min-w-0 flex-1">
                  <strong>{post.title}</strong>
                  <small>{"description" in post ? post.description : "Conteúdo recomendado pelo Samuel"}</small>
                </span>
                <b>Pronto</b>
              </button>
            ))}
          </div>
        </article>

        <article className="samuel-dashboard-card">
          <SectionTitle
            eyebrow="Próximas tarefas"
            title="Foco executivo"
            action={{ label: "Ver todas", onClick: () => onNavigate("executive-tasks") }}
          />
          <ol className="samuel-task-list">
            {priorities.length > 0 ? priorities.map((priority, index) => (
              <li key={`${priority}-${index}`}>
                <i />
                <span className="min-w-0 flex-1">
                  <strong>{priority}</strong>
                  <small>{index === 0 ? "Hoje" : index === 1 ? "Amanhã" : "Próximo ciclo"}</small>
                </span>
                <b className={cn(index === 0 ? "text-rose-500" : index === 1 ? "text-amber-500" : "text-emerald-600")}>
                  {index === 0 ? "Alta" : index === 1 ? "Média" : "Normal"}
                </b>
              </li>
            )) : (
              <li className="samuel-empty-state">As prioridades surgirão após a primeira análise.</li>
            )}
          </ol>
        </article>

        <article className="samuel-dashboard-card">
          <SectionTitle
            eyebrow="Calendário de hoje"
            title="Agenda executiva"
            action={{ label: "Ver agenda", onClick: () => onNavigate("executive-agenda") }}
          />
          <div className="samuel-calendar-list">
            {calendarItems.map((item, index) => (
              <button key={item.id} type="button" onClick={() => onNavigate("executive-agenda")}>
                <time>{index === 0 ? "10:00" : index === 1 ? "14:00" : index === 2 ? "16:30" : "18:00"}</time>
                <i />
                <span className="min-w-0">
                  <strong>{item.label}</strong>
                  <small>{item.deadline}</small>
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="samuel-dashboard-card">
          <SectionTitle
            eyebrow="Integrações ativas"
            title="Ecossistema conectado"
            action={{ label: "Gerir", onClick: () => onNavigate("google-analytics") }}
          />
          <GoogleWorkspacePanel
            companyId={data.executiveContext?.company.id}
            onSummaryChange={setGoogleWorkspaceSummary}
          />
          <div className="samuel-other-integrations">
            {[
              { label: "Analytics", connected: Boolean(data.googleAnalyticsExecutive), icon: BarChart3 },
              { label: "Meta", connected: Boolean(data.metaExecutive), icon: Megaphone },
              { label: "LinkedIn", connected: Boolean(data.linkedInExecutive), icon: BriefcaseBusiness },
            ].map((item) => (
              <button key={item.label} type="button" onClick={() => onNavigate(item.label === "Meta" ? "meta" : item.label === "LinkedIn" ? "linkedin" : "google-analytics")}>
                <item.icon />
                <span>{item.label}</span>
                <i className={item.connected ? "is-connected" : undefined} />
              </button>
            ))}
          </div>
        </article>

        <article className="samuel-dashboard-card samuel-insight-card">
          <div className="samuel-insight-visual" aria-hidden="true">
            <span><BrainCircuit /></span>
          </div>
          <p>Insights inteligentes</p>
          <h2>{insight}</h2>
          <button type="button" onClick={() => onNavigate("samuel-ai")}>
            Ver análise completa <ArrowRight className="size-3.5" />
          </button>
          <div>
            <span><ShieldCheck className="size-3.5" /> Confiança {data.executiveStatus.analysisConfidence}%</span>
            <span><Sparkles className="size-3.5" /> Growth {data.executiveCeo?.growthScore ?? 0}</span>
          </div>
        </article>
      </section>

      <Link href="/empresas" className="samuel-company-brain-link">
        <BrainCircuit className="size-4" />
        Gerir Company Brain da {companyName}
        <ArrowRight className="ml-auto size-4" />
      </Link>
    </div>
  );
}
