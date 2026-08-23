"use client";

import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  BrainCircuit,
  CalendarDays,
  Globe2,
  Inbox,
  ListTodo,
  MessageSquareText,
  Radar,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";

import { ChatPanel } from "../chat-panel";
import { AmbientParticleField } from "../shared/ambient-particle-field";
import type {
  ExecutiveWorkspaceData,
  ExecutiveWorkspaceHandlers,
} from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";

const EMPTY_CHAT_MESSAGES: [] = [];

type SamuelAiFocusProps = {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
};

type ActionCard = {
  section: WorkspaceSection;
  label: string;
  description: string;
  icon: LucideIcon;
};

const ACTIONS: ActionCard[] = [
  { section: "executive-inbox", label: "Inbox", description: "E-mails, alertas e decisões", icon: Inbox },
  { section: "executive-agenda", label: "Agenda", description: "Compromissos e execução", icon: CalendarDays },
  { section: "executive-tasks", label: "Tarefas", description: "Prioridades e próximos passos", icon: ListTodo },
  { section: "executive-watchers", label: "Monitorizar", description: "Riscos e oportunidades", icon: Radar },
  { section: "site-builder", label: "Criar site", description: "Gerar um site navegável", icon: Globe2 },
  { section: "studio", label: "Studio IA", description: "Sites, apps e código", icon: WandSparkles },
  { section: "autonomous-improvement", label: "Autoevolução", description: "Diagnóstico e melhorias", icon: BrainCircuit },
];

export function SamuelAiFocus({ data, handlers, onNavigate }: SamuelAiFocusProps) {
  const companyName = data.executiveContext?.company.name ?? data.briefing.companyName ?? "Sua empresa";
  const monitoringAlerts = data.executiveMonitoring?.alerts.length ?? 0;
  const criticalAlerts = data.watcherExecutive?.summary.criticalAlerts ?? 0;
  const alertCount = monitoringAlerts + criticalAlerts;
  const connectedSources = [
    data.executiveContext,
    data.googleAnalyticsExecutive,
    data.googleBusinessExecutive,
    data.metaExecutive,
    data.linkedInExecutive,
    data.crmExecutive,
  ].filter(Boolean).length;
  const confidence = data.orchestratorSnapshot?.confidence?.score ?? data.executiveStatus.analysisConfidence ?? 0;
  const samuelState = handlers.isProcessing
    ? data.pendingQuestion
      ? "Pensando e executando"
      : "Processando"
    : "Disponível";
  const stateDotClass = handlers.isProcessing
    ? "bg-white shadow-[0_0_16px_rgba(255,255,255,.95)] animate-pulse"
    : "bg-zinc-100 shadow-[0_0_14px_rgba(255,255,255,.72)]";
  const signal = criticalAlerts > 0
    ? {
        label: "Atenção crítica",
        detail: `${criticalAlerts} sinal${criticalAlerts === 1 ? "" : "ais"} crítico${criticalAlerts === 1 ? "" : "s"}`,
        className: "border-red-300/25 bg-red-400/10 text-red-100",
        dotClass: "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,.9)]",
      }
    : monitoringAlerts > 0
      ? {
          label: "Tenho algo para dizer",
          detail: `${monitoringAlerts} atualização${monitoringAlerts === 1 ? "" : "ões"} para rever`,
          className: "border-amber-200/20 bg-amber-200/[.07] text-amber-50",
          dotClass: "bg-amber-100 shadow-[0_0_14px_rgba(254,243,199,.72)]",
        }
      : null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[36px] border border-white/[.07] bg-[#06070a] p-2 text-zinc-100 shadow-[0_30px_100px_rgba(0,0,0,.22)] sm:p-3">
      <AmbientParticleField dense />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.025),transparent_32%,rgba(255,255,255,.012)_70%,transparent)]" />

      <section className="relative z-10 overflow-hidden rounded-[30px] border border-white/[.09] bg-black/35 px-4 py-5 text-white shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur-xl sm:px-6 lg:px-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-35%,rgba(255,255,255,.11),transparent_38%),radial-gradient(circle_at_90%_20%,rgba(226,232,240,.05),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.055] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-100 backdrop-blur-md">
                <span className={`size-2 rounded-full ${stateDotClass}`} />
                {samuelState}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[10px] uppercase tracking-[.16em] text-zinc-400">
                Executive AI Interface
              </span>
            </div>
            <h2 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl lg:text-4xl">
              Samuel AI
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Converse, delegue tarefas e acompanhe a execução da {companyName}. Voz, chat, contexto empresarial e ferramentas ficam concentrados numa única experiência.
            </p>

            {signal ? (
              <button
                type="button"
                onClick={() => onNavigate("executive-inbox")}
                className={`mt-4 inline-flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left backdrop-blur-md transition hover:-translate-y-0.5 ${signal.className}`}
              >
                <span className={`size-2.5 shrink-0 rounded-full ${signal.dotClass}`} />
                <span>
                  <strong className="block text-[11px] font-semibold">{signal.label}</strong>
                  <span className="block text-[9px] opacity-70">{signal.detail} · toque quando quiser ver</span>
                </span>
              </button>
            ) : (
              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.035] px-3.5 py-2 text-[10px] text-zinc-400 backdrop-blur-md">
                <span className="size-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.55)]" />
                Nenhum aviso pendente. Samuel permanece atento sem interromper.
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <StatusTile icon={ShieldCheck} label="Confiança" value={`${confidence}%`} />
            <StatusTile icon={Zap} label="Fontes" value={String(connectedSources)} />
            <StatusTile icon={BellRing} label="Alertas" value={String(alertCount)} />
          </div>
        </div>
      </section>

      <section className="relative z-10 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {ACTIONS.map((action) => (
          <button
            key={action.section}
            type="button"
            onClick={() => onNavigate(action.section)}
            className="group min-h-[94px] rounded-[20px] border border-white/[.08] bg-white/[.045] p-3 text-left shadow-[0_10px_30px_rgba(0,0,0,.18)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.075] hover:shadow-[0_16px_38px_rgba(0,0,0,.24)]"
          >
            <span className="mb-3 flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[.055] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition group-hover:border-white/20 group-hover:bg-white/[.09] group-hover:text-white">
              <action.icon className="size-4" strokeWidth={1.8} />
            </span>
            <strong className="block text-[11px] font-semibold text-zinc-100">{action.label}</strong>
            <small className="mt-1 block text-[9px] leading-snug text-zinc-500 transition group-hover:text-zinc-400">{action.description}</small>
          </button>
        ))}
      </section>

      <section className="relative z-10 min-h-[680px] flex-1 overflow-hidden rounded-[30px] border border-white/[.09] bg-zinc-950/72 shadow-[0_24px_70px_rgba(0,0,0,.30)] backdrop-blur-2xl">
        <AmbientParticleField />
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/[.08] bg-black/25 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_35%_25%,#ffffff,#d4d4d8_28%,#3f3f46_58%,#09090b_82%)] text-zinc-950 shadow-[0_0_26px_rgba(255,255,255,.22)]">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-100">Conversa com Samuel</p>
              <p className="truncate text-[10px] text-zinc-500">
                {handlers.isProcessing ? "Samuel está a trabalhar na sua solicitação" : "Toque no microfone para falar ou escreva uma instrução"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("executive-inbox")}
            className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[.045] px-3 py-2 text-[10px] font-medium text-zinc-300 shadow-sm backdrop-blur-md transition hover:border-white/20 hover:bg-white/[.08] hover:text-white sm:flex"
          >
            <MessageSquareText className="size-3.5" />
            Ver ações pendentes
          </button>
        </div>

        <div className="relative z-10 h-[calc(100%-66px)] min-h-0 overflow-hidden">
          <ChatPanel
            key={data.executiveContext?.company.id ?? "default-company"}
            initialMessages={EMPTY_CHAT_MESSAGES}
            companyId={data.executiveContext?.company.id ?? "default-company"}
            isProcessing={handlers.isProcessing}
            onSendMessage={handlers.onSendMessage}
            onFirstMessage={handlers.onFirstMessage}
          />
        </div>
      </section>
    </div>
  );
}

function StatusTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-xl">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="size-3.5" strokeWidth={1.7} />
        <span className="text-[9px] uppercase tracking-[.14em]">{label}</span>
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">{value}</p>
    </div>
  );
}
