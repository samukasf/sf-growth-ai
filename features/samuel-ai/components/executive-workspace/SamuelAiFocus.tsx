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
  const alertCount =
    (data.executiveMonitoring?.alerts.length ?? 0) +
    (data.watcherExecutive?.summary.criticalAlerts ?? 0);
  const connectedSources = [
    data.executiveContext,
    data.googleAnalyticsExecutive,
    data.googleBusinessExecutive,
    data.metaExecutive,
    data.linkedInExecutive,
    data.crmExecutive,
  ].filter(Boolean).length;
  const confidence = data.orchestratorSnapshot?.confidence?.score ?? data.executiveStatus.analysisConfidence ?? 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <section className="relative overflow-hidden rounded-[30px] border border-cyan-300/15 bg-[#031027] px-4 py-5 text-white shadow-[0_24px_80px_rgba(3,16,39,.22)] sm:px-6 lg:px-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-30%,rgba(34,211,238,.24),transparent_38%),radial-gradient(circle_at_90%_20%,rgba(59,130,246,.2),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(34,211,238,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.08)_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-200">
                <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.9)]" />
                Samuel online
              </span>
              <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[.06] px-3 py-1.5 text-[10px] uppercase tracking-[.16em] text-cyan-100/70">
                Executive AI Interface
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Samuel AI
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Converse, delegue tarefas e acompanhe o raciocínio executivo da {companyName}. A voz, o chat e as ferramentas ficam concentrados aqui.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <StatusTile icon={ShieldCheck} label="Confiança" value={`${confidence}%`} />
            <StatusTile icon={Zap} label="Fontes" value={String(connectedSources)} />
            <StatusTile icon={BellRing} label="Alertas" value={String(alertCount)} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {ACTIONS.map((action) => (
          <button
            key={action.section}
            type="button"
            onClick={() => onNavigate(action.section)}
            className="group min-h-[92px] rounded-[20px] border border-blue-950/[0.08] bg-white p-3 text-left shadow-[0_8px_24px_rgba(15,45,100,.05)] transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_14px_34px_rgba(14,116,144,.12)]"
          >
            <span className="mb-3 flex size-9 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-50 text-blue-700 transition group-hover:border-cyan-300 group-hover:bg-cyan-50 group-hover:text-cyan-700">
              <action.icon className="size-4" strokeWidth={1.8} />
            </span>
            <strong className="block text-[11px] font-semibold text-blue-950">{action.label}</strong>
            <small className="mt-1 block text-[9px] leading-snug text-blue-950/48">{action.description}</small>
          </button>
        ))}
      </section>

      <section className="relative min-h-[680px] flex-1 overflow-hidden rounded-[30px] border border-blue-950/[0.08] bg-white shadow-[0_22px_65px_rgba(15,45,100,.08)]">
        <div className="flex items-center justify-between gap-3 border-b border-blue-950/[0.07] bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_35%_25%,#22d3ee,#2563eb_45%,#081b48_78%)] text-white shadow-[0_0_24px_rgba(37,99,235,.28)]">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#071b48]">Conversa com Samuel</p>
              <p className="truncate text-[10px] text-blue-950/45">Voz em tempo real · chat · execução supervisionada</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("executive-inbox")}
            className="hidden items-center gap-2 rounded-xl border border-blue-950/10 bg-white px-3 py-2 text-[10px] font-medium text-blue-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 sm:flex"
          >
            <MessageSquareText className="size-3.5" />
            Ver ações pendentes
          </button>
        </div>

        <div className="h-[calc(100%-66px)] min-h-0 overflow-hidden">
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
    <div className="rounded-2xl border border-white/10 bg-white/[.055] p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-cyan-200/75">
        <Icon className="size-3.5" strokeWidth={1.7} />
        <span className="text-[9px] uppercase tracking-[.14em]">{label}</span>
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}
