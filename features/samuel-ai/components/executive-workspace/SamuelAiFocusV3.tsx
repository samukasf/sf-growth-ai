"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  Check,
  FileText,
  Film,
  Home,
  Keyboard,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircleMore,
  MessageSquareText,
  Mic,
  MonitorCog,
  MonitorUp,
  Search,
  Settings,
  Square,
  UserRoundSearch,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { ChatPanel } from "../chat-panel";
import { SamuelVoiceReliabilityBridge } from "../samuel-voice-reliability-bridge";
import type {
  ExecutiveWorkspaceData,
  ExecutiveWorkspaceHandlers,
} from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";

const EMPTY_CHAT_MESSAGES: [] = [];

type Props = {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  section?: WorkspaceSection;
  href?: string;
  conversation?: boolean;
};

type Action = {
  label: string;
  icon: LucideIcon;
  section?: WorkspaceSection;
  href?: string;
  prompt?: string;
};

type VoicePhase =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

type VoiceStateDetail = {
  phase?: VoicePhase;
  active?: boolean;
};

const LEFT_NAV: NavItem[] = [
  { label: "Início", icon: Home, section: "samuel-ai" },
  { label: "Conversar", icon: MessageSquareText, conversation: true },
  { label: "Tarefas", icon: ListChecks, section: "executive-tasks" },
  { label: "Agenda", icon: CalendarDays, section: "executive-agenda" },
  { label: "E-mails", icon: Mail, section: "gmail" },
  { label: "WhatsApp", icon: MessageCircleMore, section: "whatsapp" },
  { label: "Clientes (CRM)", icon: UsersRound, section: "crm" },
  { label: "Anúncios", icon: Megaphone, section: "marketing" },
  { label: "Sites & Apps", icon: MonitorCog, section: "site-builder" },
  { label: "Pesquisas", icon: Search, section: "executive-watchers" },
  { label: "Relatórios", icon: BarChart3, section: "dashboard" },
  { label: "Vídeos e Redes", icon: Film, section: "studio" },
  { label: "Meu computador", icon: MonitorUp, href: "/samuel-ai/desktop" },
  { label: "Configurações", icon: Settings, href: "/integrations" },
];

const PRIMARY_ACTIONS: Action[] = [
  { label: "Vídeos e posts", icon: Film, section: "studio" },
  { label: "Encontrar clientes", icon: UserRoundSearch, section: "crm" },
  { label: "Analisar empresa", icon: BarChart3, section: "executive-watchers" },
  { label: "Criar um site", icon: MonitorCog, section: "site-builder" },
  {
    label: "Gerar proposta",
    icon: FileText,
    prompt:
      "Crie uma proposta comercial profissional. Use o contexto da empresa e peça somente os dados indispensáveis que faltarem.",
  },
  { label: "Agenda", icon: CalendarDays, section: "executive-agenda" },
];

const TOOL_ACTIONS: Action[] = [
  { label: "Criar vídeo e posts", icon: Film, section: "studio" },
  { label: "Controlar computador", icon: MonitorUp, href: "/samuel-ai/desktop" },
  { label: "Encontrar clientes", icon: UserRoundSearch, section: "crm" },
  { label: "Analisar empresas", icon: BarChart3, section: "executive-watchers" },
  { label: "Criar sites e apps", icon: FileText, section: "site-builder" },
  { label: "Gerenciar anúncios", icon: Megaphone, section: "marketing" },
  { label: "Abrir e-mails", icon: Mail, section: "gmail" },
  { label: "Abrir agenda", icon: CalendarDays, section: "executive-agenda" },
];

function voicePhaseCopy(phase: VoicePhase, processing: boolean) {
  if (phase === "connecting") {
    return {
      title: "Abrindo o microfone…",
      subtitle: "Autorize o acesso para começar",
    };
  }
  if (phase === "listening") {
    return {
      title: "Estou ouvindo…",
      subtitle: "Fale naturalmente em português",
    };
  }
  if (phase === "processing" || processing) {
    return {
      title: "Estou entendendo…",
      subtitle: "Analisando e preparando a resposta",
    };
  }
  if (phase === "speaking") {
    return {
      title: "Estou respondendo…",
      subtitle: "Você pode interromper falando novamente",
    };
  }
  if (phase === "error") {
    return {
      title: "Falha no modo de voz",
      subtitle: "Toque novamente para tentar",
    };
  }
  return {
    title: "Pronto para ajudar",
    subtitle: "Toque no microfone ou escreva",
  };
}

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  );
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function SamuelAiFocusV3({ data, handlers, onNavigate }: Props) {
  const companyId = data.executiveContext?.company.id ?? "default-company";
  const companyName = data.executiveContext?.company.name ?? "Sua empresa";
  const [conversationOpen, setConversationOpen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle");

  const alertCount =
    (data.watcherExecutive?.summary.criticalAlerts ?? 0) +
    (data.executiveMonitoring?.alerts.length ?? 0);

  useEffect(() => {
    const openConversation = () => setConversationOpen(true);
    const syncVoiceState = (event: Event) => {
      const detail = (event as CustomEvent<VoiceStateDetail>).detail;
      if (detail?.phase) setVoicePhase(detail.phase);
      if (typeof detail?.active === "boolean") setVoiceActive(detail.active);
    };

    window.addEventListener("samuel:conversation-open", openConversation);
    window.addEventListener("samuel:voice-state", syncVoiceState as EventListener);

    const syncFromButton = () => {
      const mic = document.querySelector<HTMLButtonElement>(
        ".samuel-focus-cockpit .samuel-reference-mic",
      );
      if (!mic) return;
      setVoiceActive(mic.dataset.voiceMode === "jarvis");
      setVoicePhase(
        (mic.dataset.voicePhase as VoicePhase | undefined) ?? "idle",
      );
    };
    const timer = window.setTimeout(syncFromButton, 80);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("samuel:conversation-open", openConversation);
      window.removeEventListener(
        "samuel:voice-state",
        syncVoiceState as EventListener,
      );
    };
  }, []);

  const sendThroughSamuel = (message: string) => {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    setConversationOpen(true);
    window.requestAnimationFrame(() => {
      const cockpit = document.querySelector<HTMLElement>(
        ".samuel-focus-cockpit",
      );
      const textarea =
        cockpit?.querySelector<HTMLTextAreaElement>(".samuel-chat-textarea");
      if (!textarea) return;

      setNativeTextareaValue(textarea, cleanMessage);
      window.setTimeout(() => {
        const sendButton = cockpit?.querySelector<HTMLButtonElement>(
          ".samuel-chat-send:not(.is-cancel)",
        );
        if (sendButton && !sendButton.disabled) sendButton.click();
      }, 0);
    });
  };

  const runAction = (action: Action) => {
    if (action.section) onNavigate(action.section);
    else if (action.href) window.location.assign(action.href);
    else if (action.prompt) sendThroughSamuel(action.prompt);
  };

  const stopSamuel = () => {
    window.dispatchEvent(new CustomEvent("samuel:voice-stop"));
    document
      .querySelector<HTMLButtonElement>(".samuel-chat-send.is-cancel")
      ?.click();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const phaseCopy = voicePhaseCopy(voicePhase, handlers.isProcessing);

  return (
    <section className="samuel-focus-cockpit relative h-dvh w-full min-w-0 overflow-hidden bg-[#02070c] text-[#dcecff] selection:bg-cyan-400/25">
      <span hidden data-samuel-company-id={companyId} />
      <SamuelVoiceReliabilityBridge />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_32%,rgba(0,119,255,.18),transparent_30%),radial-gradient(circle_at_80%_12%,rgba(124,58,237,.09),transparent_22%),linear-gradient(180deg,#03101a_0%,#02070c_58%,#01050a_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(56,189,248,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.025)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]"
      />

      <ConversationLayer
        open={conversationOpen}
        onClose={() => setConversationOpen(false)}
        companyId={companyId}
        handlers={handlers}
      />

      <div className="relative z-10 grid h-full min-h-0 min-w-0 grid-cols-1 xl:grid-cols-[238px_minmax(0,1fr)] 2xl:grid-cols-[250px_minmax(0,1fr)_338px]">
        <DesktopSidebar
          onNavigate={onNavigate}
          onOpenConversation={() => setConversationOpen(true)}
        />

        <main className="relative min-h-0 min-w-0 overflow-y-auto overscroll-contain xl:overflow-hidden xl:border-x xl:border-cyan-300/10">
          <MobileTopbar
            companyName={companyName}
            alertCount={alertCount}
            onAlerts={() => onNavigate("executive-alerts")}
          />

          <div className="mx-auto flex min-h-full w-full min-w-0 max-w-[1120px] flex-col px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-7 xl:h-full xl:max-w-none xl:px-5 xl:pb-0 xl:pt-4 2xl:px-6">
            <header className="shrink-0 text-center">
              <p className="text-[8px] font-medium uppercase tracking-[.28em] text-[#8eb9d8] sm:text-[9px] sm:tracking-[.38em]">
                Mais ideias. Mais ações. Mais resultados.
              </p>
              <h1 className="mt-2 text-[clamp(2rem,8vw,3.35rem)] font-semibold leading-none tracking-[.08em] text-[#e5f1ff] xl:mt-2 xl:text-[clamp(2.4rem,3.4vw,4rem)]">
                SAMUEL IA
              </h1>
              <p className="mt-2 text-[9px] uppercase tracking-[.24em] text-[#9cc4e2] sm:text-[10px] sm:tracking-[.34em]">
                Seu assistente inteligente
              </p>
            </header>

            <section className="relative mt-4 shrink-0 xl:mt-2 xl:min-h-0 xl:flex-1">
              <div className="hidden xl:block">
                <StatusPoint
                  className="left-[4%] top-[15%]"
                  icon={Activity}
                  title="OUVINDO"
                  text={<>Captando e entendendo…</>}
                  color="#35d9ff"
                  active={voicePhase === "listening"}
                />
                <StatusPoint
                  className="right-[3%] top-[15%]"
                  icon={BrainCircuit}
                  title="PENSANDO"
                  text={<>Analisando e conectando ideias…</>}
                  color="#bd73ff"
                  active={
                    voicePhase === "processing" || handlers.isProcessing
                  }
                />
                <StatusPoint
                  className="bottom-[12%] left-[4%]"
                  icon={Settings}
                  title="EXECUTANDO"
                  text={<>Colocando em prática…</>}
                  color="#66ffd5"
                  active={handlers.isProcessing}
                />
                <StatusPoint
                  className="bottom-[12%] right-[3%]"
                  icon={MessageSquareText}
                  title="FALANDO"
                  text={<>Respondendo para você…</>}
                  color="#ffc89d"
                  active={voicePhase === "speaking"}
                />
              </div>

              <div className="relative mx-auto size-[clamp(210px,62vw,300px)] sm:size-[clamp(250px,48vw,330px)] xl:absolute xl:left-1/2 xl:top-1/2 xl:size-[min(43vh,410px)] xl:-translate-x-1/2 xl:-translate-y-1/2">
                <SamuelCore active={voiceActive || handlers.isProcessing} />
              </div>
            </section>

            <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-2 gap-2 xl:hidden">
              <MobileState
                icon={Activity}
                label="Ouvindo"
                color="#35d9ff"
                active={voicePhase === "listening"}
              />
              <MobileState
                icon={BrainCircuit}
                label="Pensando"
                color="#bd73ff"
                active={
                  voicePhase === "processing" || handlers.isProcessing
                }
              />
              <MobileState
                icon={Settings}
                label="Executando"
                color="#66ffd5"
                active={handlers.isProcessing}
              />
              <MobileState
                icon={MessageSquareText}
                label="Falando"
                color="#ffc89d"
                active={voicePhase === "speaking"}
              />
            </div>

            <div className="mx-auto mt-4 w-full max-w-[590px] shrink-0 rounded-[22px] border border-[#0b75cf] bg-[#031326]/90 px-4 py-3 text-center shadow-[0_0_32px_rgba(0,118,255,.10)] backdrop-blur-xl xl:mt-1">
              <div
                className="flex items-center justify-center gap-3"
                aria-live="polite"
              >
                <Activity
                  className={`size-5 shrink-0 text-[#20b6ff] ${
                    voiceActive ? "animate-pulse motion-reduce:animate-none" : ""
                  }`}
                />
                <div className="min-w-0 text-left sm:text-center">
                  <strong className="block truncate text-sm text-white">
                    {phaseCopy.title}
                  </strong>
                  <span className="block truncate text-[11px] text-[#a9c8e3]">
                    {phaseCopy.subtitle}
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-4 grid w-full max-w-[610px] shrink-0 grid-cols-[1fr_1.4fr_1fr] items-start gap-3 text-center sm:gap-7 xl:mt-3">
              <RoundControl
                icon={Keyboard}
                label="Digitar"
                onClick={() => setConversationOpen(true)}
              />
              <button
                type="button"
                className="samuel-reference-mic group mx-auto flex min-h-24 min-w-24 touch-manipulation flex-col items-center justify-start gap-2 rounded-2xl text-xs font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
              >
                <span className="relative flex size-[82px] items-center justify-center rounded-full border border-[#0b71e6] bg-[radial-gradient(circle,#0a3d7c_0%,#061d3d_55%,#020b16_100%)] shadow-[0_0_0_7px_rgba(0,116,255,.09),0_0_30px_rgba(0,152,255,.42)] transition-transform group-active:scale-95 sm:size-[92px] xl:size-[96px]">
                  <span
                    className={`absolute inset-[-9px] rounded-full border border-cyan-300/15 motion-reduce:animate-none ${
                      voiceActive ? "animate-ping" : "animate-pulse"
                    }`}
                  />
                  <Mic className="size-8 text-white drop-shadow-[0_0_12px_#00a9ff] sm:size-9" />
                </span>
                <span>
                  {voicePhase === "processing"
                    ? "Pensando"
                    : voicePhase === "speaking"
                      ? "Falando"
                      : voiceActive
                        ? "Ouvindo"
                        : "Toque para falar"}
                </span>
              </button>
              <RoundControl
                icon={Square}
                label="Encerrar"
                onClick={stopSamuel}
              />
            </div>

            <div className="mt-5 shrink-0 xl:mt-3">
              <div className="flex gap-2 overflow-x-auto pb-2 xl:grid xl:grid-cols-6 xl:overflow-visible xl:pb-0">
                {PRIMARY_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => runAction(action)}
                    className="flex min-h-14 min-w-[145px] touch-manipulation items-center justify-center gap-2 rounded-xl border border-[#0b568e] bg-[#03101b]/88 px-3 text-[11px] text-white transition hover:border-[#119dff] hover:bg-[#061a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 xl:min-w-0"
                  >
                    <action.icon className="size-[18px] shrink-0 text-[#1aa8ff]" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <MobileSupportPanels
              actions={TOOL_ACTIONS}
              onAction={runAction}
              phaseCopy={phaseCopy}
              companyReady={companyId !== "default-company"}
              voiceActive={voiceActive}
            />

            <footer className="mt-6 hidden h-10 shrink-0 items-center justify-between border-t border-[#0b456d]/50 px-1 text-[8px] uppercase tracking-[.2em] text-[#87aac7] xl:flex 2xl:mt-3">
              <span>
                <strong className="text-[#dbeeff]">SF GROWTH AI</strong> · Automação ·
                Resultados · Liberdade
              </span>
              <span className="hidden 2xl:inline">Transformando ideias em realidade</span>
            </footer>
          </div>
        </main>

        <DesktopRightPanel
          actions={TOOL_ACTIONS}
          onAction={runAction}
          alertCount={alertCount}
          onAlerts={() => onNavigate("executive-alerts")}
          phaseCopy={phaseCopy}
          companyName={companyName}
          companyReady={companyId !== "default-company"}
          voiceActive={voiceActive}
        />
      </div>

      <MobileBottomNav
        onNavigate={onNavigate}
        onOpenConversation={() => setConversationOpen(true)}
      />
    </section>
  );
}

function ConversationLayer({
  open,
  onClose,
  companyId,
  handlers,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
  handlers: ExecutiveWorkspaceHandlers;
}) {
  return (
    <div
      className={
        open
          ? "fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-0 backdrop-blur-md sm:p-4"
          : "pointer-events-none fixed left-[-10000px] top-0 h-px w-px overflow-hidden opacity-0"
      }
      aria-hidden={!open}
    >
      <div
        className={
          open
            ? "flex h-dvh w-full max-w-5xl min-w-0 flex-col overflow-hidden border border-[#0d78c5] bg-[#03101b] shadow-[0_0_70px_rgba(0,127,255,.25)] sm:h-[min(90dvh,860px)] sm:rounded-3xl"
            : "h-full w-full"
        }
      >
        {open && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#164f78] px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4">
            <div className="min-w-0">
              <strong className="block truncate text-base text-white">
                Conversar com Samuel
              </strong>
              <span className="mt-1 block truncate text-xs text-[#86abc9]">
                Voz, texto e execução no mesmo fluxo.
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 shrink-0 rounded-xl border border-[#164f78] px-4 text-sm text-[#b9d9f1] hover:border-[#0d9dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              Fechar
            </button>
          </div>
        )}
        <div className={open ? "min-h-0 flex-1 overflow-hidden" : "h-full w-full"}>
          <ChatPanel
            key={companyId}
            initialMessages={EMPTY_CHAT_MESSAGES}
            companyId={companyId}
            isProcessing={handlers.isProcessing}
            onSendMessage={handlers.onSendMessage}
            onFirstMessage={handlers.onFirstMessage}
          />
        </div>
      </div>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={`relative shrink-0 overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#06111c] shadow-[0_0_24px_rgba(0,174,255,.20)] ${
          compact ? "size-10" : "size-12"
        }`}
      >
        <Image
          src="/icons/samuel-app-icon.svg"
          alt=""
          fill
          sizes={compact ? "40px" : "48px"}
          className="object-cover"
          priority
        />
      </div>
      <div className="min-w-0">
        <div
          className={`${compact ? "text-sm" : "text-base"} truncate font-semibold tracking-[.12em] text-[#d8edff]`}
        >
          SAMUEL IA
        </div>
        <div className="mt-0.5 truncate text-[8px] font-semibold tracking-[.2em] text-[#7fa9c7]">
          SF GROWTH AI
        </div>
      </div>
    </div>
  );
}

function DesktopSidebar({
  onNavigate,
  onOpenConversation,
}: {
  onNavigate: (section: WorkspaceSection) => void;
  onOpenConversation: () => void;
}) {
  return (
    <aside className="hidden min-h-0 min-w-0 flex-col bg-[linear-gradient(180deg,rgba(3,16,26,.97),rgba(2,8,14,.97))] p-4 xl:flex">
      <div className="px-2 py-2">
        <BrandMark />
      </div>

      <nav className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1">
        {LEFT_NAV.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="size-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </>
          );
          const classes = `flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 text-left text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
            index === 0
              ? "border-[#087cf5] bg-[linear-gradient(90deg,rgba(10,76,155,.65),rgba(9,35,69,.72))] font-semibold text-white shadow-[inset_0_0_24px_rgba(0,119,255,.10)]"
              : "border-transparent text-[#accde7] hover:border-cyan-300/15 hover:bg-cyan-300/[.04] hover:text-white"
          }`;

          if (item.href) {
            return (
              <Link key={item.label} href={item.href} className={classes}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              className={classes}
              onClick={() =>
                item.conversation
                  ? onOpenConversation()
                  : item.section && onNavigate(item.section)
              }
            >
              {content}
            </button>
          );
        })}
      </nav>

      <div className="mt-3 rounded-2xl border border-[#0b6db5]/55 bg-[#03101b]/90 p-4">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#2dff83] shadow-[0_0_10px_rgba(45,255,131,.7)]" />
          <strong className="text-xs text-white">Samuel Online</strong>
          <Activity className="ml-auto size-5 text-[#1ba9ff]" />
        </div>
        <p className="mt-2 text-[10px] leading-5 text-[#91b5d0]">
          Voz, contexto empresarial e execução supervisionada.
        </p>
      </div>
    </aside>
  );
}

function MobileTopbar({
  companyName,
  alertCount,
  onAlerts,
}: {
  companyName: string;
  alertCount: number;
  onAlerts: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex min-h-[64px] items-center justify-between gap-3 border-b border-white/[.06] bg-[#020a12]/88 px-4 pb-2 pt-[max(.5rem,env(safe-area-inset-top))] backdrop-blur-2xl xl:hidden">
      <BrandMark compact />
      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden max-w-32 truncate text-[10px] text-white/45 sm:block">
          {companyName}
        </span>
        <button
          type="button"
          aria-label="Abrir alertas"
          onClick={onAlerts}
          className="relative flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/[.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <Bell className="size-5 text-white/70" />
          {alertCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              {Math.min(alertCount, 9)}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function DesktopRightPanel({
  actions,
  onAction,
  alertCount,
  onAlerts,
  phaseCopy,
  companyName,
  companyReady,
  voiceActive,
}: {
  actions: Action[];
  onAction: (action: Action) => void;
  alertCount: number;
  onAlerts: () => void;
  phaseCopy: { title: string; subtitle: string };
  companyName: string;
  companyReady: boolean;
  voiceActive: boolean;
}) {
  return (
    <aside className="hidden min-h-0 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,#020a11,#02080e)] p-4 2xl:block">
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onAlerts}
          aria-label="Abrir alertas"
          className="relative flex size-11 items-center justify-center rounded-full border border-white/[.07] bg-white/[.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <Bell className="size-5 text-[#c9e6ff]" />
          {alertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">
              {Math.min(alertCount, 9)}
            </span>
          )}
        </button>
        <Link
          href="/empresas"
          aria-label="Abrir empresas"
          className="flex size-11 items-center justify-center rounded-full border border-[#0f8bff] text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          SF
        </Link>
      </div>

      <section className="mt-4 rounded-2xl border border-[#0b75c7] bg-[#03101b]/88 p-4 shadow-[0_18px_60px_rgba(0,0,0,.18)]">
        <h2 className="text-lg font-semibold text-white">
          Como posso ajudar você hoje?
        </h2>
        <p className="mt-2 text-xs leading-5 text-[#9fbfd7]">
          Ações diretas para {companyName}.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onAction(action)}
              className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border border-[#0a426e] bg-[#051321] p-3 text-center text-[11px] text-white transition hover:border-[#0c9cff] hover:bg-[#071a2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              <action.icon className="size-6 text-[#1cb4ff]" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <StatusCard
        className="mt-4"
        phaseCopy={phaseCopy}
        companyReady={companyReady}
        voiceActive={voiceActive}
      />

      <blockquote className="mt-4 rounded-2xl border border-[#0b75c7] bg-[#03101b]/88 p-5 text-sm italic leading-6 text-[#c7dcec]">
        “Mais do que uma IA,
        <br />
        um parceiro para o seu crescimento.”
        <div className="mt-3 text-right text-base not-italic text-[#e0efff]">
          Samuel IA
        </div>
      </blockquote>
    </aside>
  );
}

function MobileSupportPanels({
  actions,
  onAction,
  phaseCopy,
  companyReady,
  voiceActive,
}: {
  actions: Action[];
  onAction: (action: Action) => void;
  phaseCopy: { title: string; subtitle: string };
  companyReady: boolean;
  voiceActive: boolean;
}) {
  return (
    <div className="mt-6 grid gap-3 xl:grid-cols-2 2xl:hidden">
      <section className="rounded-2xl border border-[#0b568e] bg-[#03101b]/72 p-4 backdrop-blur-xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[.2em] text-[#7da8c9]">
              Ferramentas
            </p>
            <h2 className="mt-1 text-sm font-semibold text-white">
              Acesso rápido
            </h2>
          </div>
          <span className="text-[10px] text-white/35">deslize para ver</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onAction(action)}
              className="flex min-h-[72px] min-w-[132px] touch-manipulation flex-col items-start justify-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left text-[11px] text-[#d9ebfa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              <action.icon className="size-5 text-[#1cb4ff]" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <StatusCard
        phaseCopy={phaseCopy}
        companyReady={companyReady}
        voiceActive={voiceActive}
      />
    </div>
  );
}

function StatusCard({
  className = "",
  phaseCopy,
  companyReady,
  voiceActive,
}: {
  className?: string;
  phaseCopy: { title: string; subtitle: string };
  companyReady: boolean;
  voiceActive: boolean;
}) {
  return (
    <section
      className={`${className} rounded-2xl border border-[#0b568e] bg-[#03101b]/80 p-4 backdrop-blur-xl`}
    >
      <h3 className="text-sm font-semibold text-white">Status em tempo real</h3>
      <div className="mt-3 space-y-2.5 text-xs text-[#aecce2]">
        <LiveStatus label={phaseCopy.title} active={voiceActive} />
        <LiveStatus label="Interface pronta" active />
        <LiveStatus
          label={companyReady ? "Contexto da empresa carregado" : "Contexto padrão ativo"}
          active={companyReady}
        />
        <LiveStatus label="Execução supervisionada" active />
      </div>
    </section>
  );
}

function SamuelCore({ active }: { active: boolean }) {
  return (
    <div
      className={`samuel-orb relative h-full w-full rounded-full transition-transform duration-500 ${
        active ? "samuel-orb--active scale-[1.02]" : ""
      }`}
    >
      <div className="samuel-orb__halo absolute inset-[-8%] rounded-full" />
      <div className="absolute inset-0 animate-[spin_24s_linear_infinite] rounded-full border border-cyan-200/20 [background:repeating-conic-gradient(from_0deg,rgba(0,174,255,.65)_0deg_1.4deg,transparent_1.4deg_10deg)] [mask-image:radial-gradient(circle,transparent_63%,black_64%)] motion-reduce:animate-none" />
      <div className="absolute inset-[5%] animate-[spin_15s_linear_infinite_reverse] rounded-full border border-blue-300/25 [background:repeating-conic-gradient(from_25deg,rgba(77,132,255,.55)_0deg_2deg,transparent_2deg_15deg)] [mask-image:radial-gradient(circle,transparent_70%,black_71%)] motion-reduce:animate-none" />
      <div className="absolute inset-[10%] rounded-full bg-[conic-gradient(from_210deg,#07c8ff,#0a65ff_20%,#7648ff_37%,#ffbb8c_52%,#18d6e7_72%,#0088ff_88%,#07c8ff)] p-[4px] shadow-[0_0_50px_rgba(0,150,255,.52),0_0_90px_rgba(83,74,255,.18)]">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#020914]">
          <div className="absolute inset-0 animate-[spin_18s_linear_infinite] bg-[conic-gradient(from_20deg,transparent,#0a75ff55,transparent,#ac63ff55,transparent,#ffbb8c44,transparent,#00dcff55,transparent)] motion-reduce:animate-none" />
          <div className="absolute inset-[7%] animate-[spin_11s_linear_infinite_reverse] rounded-full opacity-90 [background:repeating-conic-gradient(from_0deg,transparent_0deg_9deg,rgba(38,189,255,.75)_10deg_11deg,transparent_12deg_23deg)] [mask-image:radial-gradient(circle,transparent_12%,black_48%,transparent_72%)] motion-reduce:animate-none" />
          <div
            className={`absolute inset-[19%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#0b62bd_0%,#062253_25%,#050a1d_52%,#010308_100%)] shadow-[inset_0_0_55px_rgba(0,184,255,.55),0_0_36px_rgba(0,174,255,.18)] ${
              active ? "animate-pulse motion-reduce:animate-none" : ""
            }`}
          />
          <div className="absolute inset-[23%] animate-[spin_8s_linear_infinite] rounded-full [background:conic-gradient(from_0deg,transparent_0_12%,rgba(48,211,255,.5)_18%,transparent_24%_42%,rgba(139,92,246,.55)_48%,transparent_56%_70%,rgba(255,183,118,.45)_77%,transparent_84%)] [mask-image:radial-gradient(circle,transparent_0_42%,black_48%_58%,transparent_64%)] motion-reduce:animate-none" />
          <div className="absolute left-[21%] top-[43%] h-[16%] w-[60%] animate-[spin_7s_linear_infinite_reverse] rounded-[50%] border-2 border-cyan-200/65 shadow-[0_0_18px_rgba(60,217,255,.7)] motion-reduce:animate-none" />
          <div className="absolute left-[28%] top-[25%] h-[50%] w-[44%] animate-[spin_12s_linear_infinite] rounded-[50%] border-2 border-violet-300/55 shadow-[0_0_16px_rgba(165,90,255,.5)] motion-reduce:animate-none" />
          <div className="absolute left-1/2 top-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-cyan-200/20 shadow-[0_0_34px_rgba(103,232,249,.55)] motion-reduce:animate-none" />
          <div className="samuel-orb__wave absolute left-[14%] right-[14%] top-1/2 h-px bg-cyan-200/70 shadow-[0_0_12px_#25c9ff]" />
          {Array.from({ length: 24 }, (_, index) => (
            <i
              key={index}
              className="absolute size-[2px] animate-pulse rounded-full bg-cyan-100 shadow-[0_0_6px_#4de8ff] motion-reduce:animate-none"
              style={{
                left: `${12 + ((index * 37) % 76)}%`,
                top: `${10 + ((index * 53) % 80)}%`,
                animationDelay: `${(index % 8) * 120}ms`,
                opacity: 0.35 + (index % 5) * 0.13,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPoint({
  className,
  icon: Icon,
  title,
  text,
  color,
  active,
}: {
  className: string;
  icon: LucideIcon;
  title: string;
  text: ReactNode;
  color: string;
  active: boolean;
}) {
  return (
    <div className={`absolute ${className} w-[150px]`}>
      <div className="flex items-center gap-2">
        <Icon
          className="size-7"
          style={{ color, filter: `drop-shadow(0 0 10px ${color})` }}
        />
        {active && (
          <span className="size-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] motion-reduce:animate-none" />
        )}
      </div>
      <strong className="mt-2 block text-[13px] text-[#e1efff]">{title}</strong>
      <p className="mt-1.5 text-[11px] leading-4 text-[#8fb8d6]">{text}</p>
    </div>
  );
}

function MobileState({
  icon: Icon,
  label,
  color,
  active,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex min-h-12 min-w-0 items-center gap-2 rounded-xl border px-3 ${
        active
          ? "border-cyan-300/45 bg-cyan-300/[.09]"
          : "border-white/[.07] bg-white/[.025]"
      }`}
    >
      <Icon
        className="size-[18px] shrink-0"
        style={{ color, filter: `drop-shadow(0 0 8px ${color})` }}
      />
      <span className="min-w-0 truncate text-[11px] font-semibold text-[#dcecff]">
        {label}
      </span>
      {active && (
        <span className="ml-auto size-2 shrink-0 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />
      )}
    </div>
  );
}

function RoundControl({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mx-auto flex min-h-20 min-w-16 touch-manipulation flex-col items-center gap-2 rounded-xl text-[11px] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
    >
      <span className="flex size-[58px] items-center justify-center rounded-full border border-[#0d65ac] bg-[#03101b] transition group-hover:border-[#2aaeff] group-active:scale-95 sm:size-[64px]">
        <Icon className="size-5 sm:size-6" />
      </span>
      <span>{label}</span>
    </button>
  );
}

function LiveStatus({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
          active ? "bg-emerald-400/15" : "bg-white/[.04]"
        }`}
      >
        {active ? (
          <Check className="size-3 text-emerald-400" />
        ) : (
          <span className="size-1.5 rounded-full bg-white/30" />
        )}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </div>
  );
}

function MobileBottomNav({
  onNavigate,
  onOpenConversation,
}: {
  onNavigate: (section: WorkspaceSection) => void;
  onOpenConversation: () => void;
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-5 rounded-[22px] border border-white/[.09] bg-[#07111c]/94 p-2 shadow-[0_18px_60px_rgba(0,0,0,.55)] backdrop-blur-2xl xl:hidden"
    >
      <MobileNav
        icon={Home}
        label="Início"
        onClick={() => onNavigate("samuel-ai")}
      />
      <MobileNav
        icon={Film}
        label="Vídeos"
        onClick={() => onNavigate("studio")}
      />
      <MobileNav
        icon={Mic}
        label="Samuel"
        onClick={onOpenConversation}
        primary
      />
      <MobileNav
        icon={MonitorUp}
        label="Computador"
        onClick={() => window.location.assign("/samuel-ai/desktop")}
      />
      <MobileNav
        icon={UsersRound}
        label="CRM"
        onClick={() => onNavigate("crm")}
      />
    </nav>
  );
}

function MobileNav({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-12 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl text-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
        primary
          ? "text-cyan-100"
          : "text-white/42 active:bg-white/[.04] active:text-white"
      }`}
    >
      {primary && (
        <span className="absolute -top-5 flex size-12 items-center justify-center rounded-full border border-cyan-300/25 bg-[radial-gradient(circle_at_38%_30%,#155e75,#0f2744_58%,#05070b)] shadow-[0_0_28px_rgba(34,211,238,.22)]" />
      )}
      <Icon className={`relative z-10 ${primary ? "size-5" : "size-4"}`} />
      <span className="relative z-10 truncate">{label}</span>
    </button>
  );
}
