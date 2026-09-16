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
  Menu,
  Megaphone,
  MessageSquareText,
  Mic,
  MonitorCog,
  Search,
  Settings,
  Square,
  Sun,
  UserRoundSearch,
  UsersRound,
  X,
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

type VoicePhase =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

type VoiceStateDetail = { phase?: VoicePhase; active?: boolean };

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
  prompt?: string;
};

const MAIN_NAV: NavItem[] = [
  { label: "Início", icon: Home, section: "samuel-ai" },
  { label: "Conversar", icon: MessageSquareText, conversation: true },
  { label: "Tarefas", icon: ListChecks, section: "executive-tasks" },
  { label: "Agenda", icon: CalendarDays, section: "executive-agenda" },
  { label: "E-mails", icon: Mail, section: "gmail" },
  { label: "Clientes (CRM)", icon: UsersRound, section: "crm" },
  { label: "Anúncios", icon: Megaphone, section: "marketing" },
  { label: "Sites & Apps", icon: MonitorCog, section: "site-builder" },
  { label: "Pesquisas", icon: Search, section: "executive-watchers" },
  { label: "Relatórios", icon: BarChart3, section: "dashboard" },
  { label: "Studio IA", icon: Film, section: "studio" },
  { label: "Configurações", icon: Settings, href: "/integrations" },
];

const RIGHT_ACTIONS: Action[] = [
  { label: "Encontrar clientes", icon: UserRoundSearch, section: "crm" },
  { label: "Analisar empresas", icon: BarChart3, section: "executive-watchers" },
  { label: "Criar sites e apps", icon: FileText, section: "site-builder" },
  { label: "Gerenciar anúncios", icon: Megaphone, section: "marketing" },
  { label: "Enviar e-mails", icon: Mail, section: "gmail" },
  { label: "Agendar tarefas", icon: CalendarDays, section: "executive-agenda" },
];

const QUICK_ACTIONS: Action[] = [
  { label: "Encontrar clientes", icon: UserRoundSearch, section: "crm" },
  { label: "Analisar uma empresa", icon: BarChart3, section: "executive-watchers" },
  { label: "Criar um site", icon: MonitorCog, section: "site-builder" },
  {
    label: "Gerar uma proposta",
    icon: FileText,
    prompt:
      "Crie uma proposta comercial profissional usando o contexto da empresa e peça somente os dados indispensáveis que faltarem.",
  },
  { label: "Agendar tarefa", icon: CalendarDays, section: "executive-agenda" },
];

function phaseCopy(phase: VoicePhase, processing: boolean) {
  if (phase === "connecting") {
    return {
      title: "Abrindo o microfone...",
      subtitle: "Autorize o acesso para começar",
    };
  }
  if (phase === "listening") {
    return {
      title: "Estou ouvindo...",
      subtitle: "Fale naturalmente em português",
    };
  }
  if (phase === "processing" || processing) {
    return {
      title: "Estou pensando...",
      subtitle: "Analisando e conectando ideias",
    };
  }
  if (phase === "speaking") {
    return {
      title: "Estou falando...",
      subtitle: "Respondendo para você",
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

export function SamuelAiFocusV6({ data, handlers, onNavigate }: Props) {
  const companyId = data.executiveContext?.company.id ?? "default-company";
  const [conversationOpen, setConversationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle");

  const alertCount =
    (data.watcherExecutive?.summary.criticalAlerts ?? 0) +
    (data.executiveMonitoring?.alerts.length ?? 0);

  useEffect(() => {
    const openConversation = () => setConversationOpen(true);
    const syncVoice = (event: Event) => {
      const detail = (event as CustomEvent<VoiceStateDetail>).detail;
      if (detail?.phase) setVoicePhase(detail.phase);
      if (typeof detail?.active === "boolean") setVoiceActive(detail.active);
    };
    const syncInitial = () => {
      const mic = document.querySelector<HTMLButtonElement>(
        ".samuel-focus-cockpit .samuel-reference-mic",
      );
      if (!mic) return;
      setVoiceActive(mic.dataset.voiceMode === "jarvis");
      setVoicePhase(
        (mic.dataset.voicePhase as VoicePhase | undefined) ?? "idle",
      );
    };

    window.addEventListener("samuel:conversation-open", openConversation);
    window.addEventListener("samuel:voice-state", syncVoice as EventListener);
    const timer = window.setTimeout(syncInitial, 100);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("samuel:conversation-open", openConversation);
      window.removeEventListener("samuel:voice-state", syncVoice as EventListener);
    };
  }, []);

  const sendThroughSamuel = (message: string) => {
    const clean = message.trim();
    if (!clean) return;
    setConversationOpen(true);
    window.requestAnimationFrame(() => {
      const cockpit = document.querySelector<HTMLElement>(".samuel-focus-cockpit");
      const textarea = cockpit?.querySelector<HTMLTextAreaElement>(
        ".samuel-chat-textarea",
      );
      if (!textarea) return;
      setNativeTextareaValue(textarea, clean);
      window.setTimeout(() => {
        cockpit
          ?.querySelector<HTMLButtonElement>(
            ".samuel-chat-send:not(.is-cancel)",
          )
          ?.click();
      }, 0);
    });
  };

  const runAction = (action: Action) => {
    if (action.section) onNavigate(action.section);
    else if (action.prompt) sendThroughSamuel(action.prompt);
  };

  const stopSamuel = () => {
    window.dispatchEvent(new CustomEvent("samuel:voice-stop"));
    document
      .querySelector<HTMLButtonElement>(".samuel-chat-send.is-cancel")
      ?.click();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const navigate = (section: WorkspaceSection) => {
    setMenuOpen(false);
    onNavigate(section);
  };

  const copy = phaseCopy(voicePhase, handlers.isProcessing);
  const processing = voicePhase === "processing" || handlers.isProcessing;

  return (
    <section className="samuel-focus-cockpit samuel-pixel-ui relative h-dvh w-full min-w-0 overflow-hidden bg-[#01060c] text-[#dcecff]">
      <span hidden data-samuel-company-id={companyId} />
      <SamuelVoiceReliabilityBridge />
      <ConversationLayer
        open={conversationOpen}
        onClose={() => setConversationOpen(false)}
        companyId={companyId}
        handlers={handlers}
      />

      <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[286px_minmax(0,1fr)] 2xl:grid-cols-[286px_minmax(680px,1fr)_380px]">
        <DesktopSidebar
          onNavigate={navigate}
          onOpenConversation={() => setConversationOpen(true)}
        />

        <main className="relative min-h-0 min-w-0 overflow-y-auto border-[#0d4775]/45 xl:border-l 2xl:border-r [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CinematicBackdrop />
          <MobileHeader
            alertCount={alertCount}
            onAlerts={() => navigate("executive-alerts")}
            onMenu={() => setMenuOpen(true)}
          />

          <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1080px] flex-col px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 xl:max-w-none xl:px-7 xl:pb-4 2xl:px-8">
            <header className="shrink-0 text-center xl:pt-0.5">
              <p className="text-[8px] font-medium uppercase tracking-[.34em] text-[#a5c7e2] sm:text-[9px] sm:tracking-[.48em] xl:text-[10px]">
                Mais ideias. Mais ações. Mais resultados.
              </p>
              <h1 className="mt-2 text-[clamp(2.45rem,9vw,4.2rem)] font-semibold leading-none tracking-[.08em] text-[#e7f2ff] [text-shadow:0_0_28px_rgba(91,172,255,.2)] xl:text-[clamp(3rem,4.1vw,4.7rem)]">
                SAMUEL IA
              </h1>
              <div className="mt-2 flex items-center justify-center gap-3 text-[8px] uppercase tracking-[.32em] text-[#b3d0e8] sm:text-[10px] sm:tracking-[.48em]">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#159bff]" />
                <span>Seu assistente inteligente</span>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#159bff]" />
              </div>
            </header>

            <section className="relative mt-2 min-h-[430px] shrink-0 sm:min-h-[500px] xl:mt-0 xl:min-h-[500px] xl:flex-1 2xl:min-h-[510px]">
              <div className="absolute inset-0 hidden xl:block">
                <OrbState
                  className="left-[4%] top-[16%]"
                  icon={Activity}
                  title="OUVINDO"
                  text={<>Captando<br />e entendendo...</>}
                  color="#25d7ff"
                  active={voicePhase === "listening"}
                />
                <OrbState
                  className="right-[3%] top-[16%]"
                  icon={BrainCircuit}
                  title="PENSANDO"
                  text={<>Analisando e<br />conectando ideias...</>}
                  color="#b56aff"
                  active={processing}
                />
                <OrbState
                  className="bottom-[12%] left-[4%]"
                  icon={Settings}
                  title="EXECUTANDO"
                  text={<>Colocando em<br />prática...</>}
                  color="#37f5c8"
                  active={handlers.isProcessing}
                />
                <OrbState
                  className="bottom-[12%] right-[3%]"
                  icon={MessageSquareText}
                  title="FALANDO"
                  text={<>Respondendo<br />para você...</>}
                  color="#ffb67a"
                  active={voicePhase === "speaking"}
                />
              </div>

              <div className="absolute left-1/2 top-1/2 size-[min(84vw,355px)] -translate-x-1/2 -translate-y-1/2 sm:size-[min(66vw,430px)] xl:size-[min(55vh,535px)] 2xl:size-[min(53vh,540px)]">
                <LivingCore active={voiceActive || processing} phase={voicePhase} />
              </div>

              <div className="absolute inset-0 xl:hidden">
                <MobileOrbState className="left-0 top-[15%]" icon={Activity} label="OUVINDO" sub="Captando e entendendo..." color="#25d7ff" active={voicePhase === "listening"} />
                <MobileOrbState className="right-0 top-[15%] text-right" icon={BrainCircuit} label="PENSANDO" sub="Analisando ideias..." color="#b56aff" active={processing} align="right" />
                <MobileOrbState className="bottom-[14%] left-0" icon={Settings} label="EXECUTANDO" sub="Colocando em prática..." color="#37f5c8" active={handlers.isProcessing} />
                <MobileOrbState className="bottom-[14%] right-0 text-right" icon={MessageSquareText} label="FALANDO" sub="Respondendo para você..." color="#ffb67a" active={voicePhase === "speaking"} align="right" />
              </div>
            </section>

            <VoiceStatusCard title={copy.title} subtitle={copy.subtitle} active={voiceActive} />

            <div className="mx-auto mt-3 grid w-full max-w-[610px] shrink-0 grid-cols-[1fr_1.35fr_1fr] items-start gap-3 text-center sm:gap-8">
              <RoundControl
                icon={Keyboard}
                label="Digitar"
                onClick={() => setConversationOpen(true)}
              />
              <PrimaryMic active={voiceActive} phase={voicePhase} />
              <RoundControl icon={Square} label="Encerrar" onClick={stopSamuel} />
            </div>

            <QuickActions actions={QUICK_ACTIONS} onAction={runAction} />

            <MobileContent
              actions={RIGHT_ACTIONS}
              onAction={runAction}
              voiceActive={voiceActive}
              companyReady={companyId !== "default-company"}
              copy={copy}
            />

            <footer className="mt-4 hidden min-h-10 shrink-0 items-center justify-between border-t border-[#0a416a]/50 px-1 pt-3 text-[8px] uppercase tracking-[.24em] text-[#7e9eb8] xl:flex">
              <span>
                <strong className="text-white">SF GROWTH AI</strong> &nbsp;|&nbsp;
                Automação · Resultados · Liberdade
              </span>
              <span className="hidden 2xl:inline">Transformando ideias em realidade</span>
            </footer>
          </div>
        </main>

        <RightPanel
          actions={RIGHT_ACTIONS}
          onAction={runAction}
          alertCount={alertCount}
          onAlerts={() => navigate("executive-alerts")}
          voiceActive={voiceActive}
          companyReady={companyId !== "default-company"}
          copy={copy}
        />
      </div>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={navigate}
        onOpenConversation={() => {
          setMenuOpen(false);
          setConversationOpen(true);
        }}
      />
      <MobileBottomNav onNavigate={navigate} onMore={() => setMenuOpen(true)} />
      <SamuelPixelStyles />
    </section>
  );
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`relative shrink-0 ${compact ? "size-12" : "size-[62px]"}`}>
        <div className="absolute inset-[16%] rounded-full bg-[#087dff]/30 blur-xl" />
        <Image
          src="/brand/samuel-s-reference.svg"
          alt="Samuel IA"
          fill
          sizes={compact ? "48px" : "62px"}
          className="object-contain drop-shadow-[0_0_13px_rgba(0,155,255,.72)]"
          priority
        />
      </div>
      <div className="min-w-0">
        <div className={`${compact ? "text-[16px]" : "text-[20px]"} truncate font-medium tracking-[.13em] text-[#dcefff]`}>
          SAMUEL IA
        </div>
        <div className="mt-1 truncate text-[8px] font-semibold tracking-[.25em] text-[#8ec5ea]">
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
    <aside className="relative hidden min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#03101a_0%,#020910_55%,#02070c_100%)] px-5 pb-4 pt-5 xl:flex">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#0b8ee8]/45 to-transparent" />
      <BrandLockup />
      <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MAIN_NAV.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="size-[21px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </>
          );
          const classes = `samuel-nav-item flex min-h-[47px] w-full items-center gap-4 rounded-[12px] border px-4 text-left text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
            index === 0
              ? "is-active border-[#087cf5] bg-[linear-gradient(90deg,rgba(11,69,143,.86),rgba(6,33,69,.9))] font-semibold text-white"
              : "border-transparent text-[#b8d7ef] hover:border-[#0a6cab]/45 hover:bg-[#071927]/70 hover:text-white"
          }`;
          if (item.href)
            return (
              <Link key={item.label} href={item.href} className={classes}>
                {content}
              </Link>
            );
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

      <div className="samuel-neon-card mt-3 rounded-[16px] border border-[#0a70b8] bg-[#03101b]/95 p-4">
        <div className="flex items-center gap-2">
          <span className="samuel-online-dot size-2.5 rounded-full bg-[#32ff7e]" />
          <strong className="text-sm text-white">Samuel Online</strong>
          <Activity className="samuel-neon-icon ml-auto size-5 text-[#21b6ff]" />
        </div>
        <p className="mt-2 text-[10px] leading-5 text-[#bad2e4]">
          Voz em tempo real ativa<br />
          Execução supervisionada<br />
          Resposta em segundos
        </p>
        <div className="mt-2 flex gap-3 text-[9px] text-[#65bdec]">
          <button type="button" onClick={() => onNavigate("whatsapp")}>
            WhatsApp
          </button>
          <Link href="/samuel-ai/desktop">Meu computador</Link>
        </div>
      </div>

      <blockquote className="px-3 pb-1 pt-5 text-[12px] italic leading-5 text-[#a8c3d7]">
        “Disciplina hoje,<br />resultados amanhã.”<br />
        <span className="text-[#d8ebfa]">— Samuel IA</span>
      </blockquote>
    </aside>
  );
}

function MobileHeader({
  alertCount,
  onAlerts,
  onMenu,
}: {
  alertCount: number;
  onAlerts: () => void;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex min-h-[70px] items-center justify-between border-b border-[#0b4774]/35 bg-[#020a12]/88 px-4 pb-2 pt-[max(.6rem,env(safe-area-inset-top))] backdrop-blur-2xl xl:hidden">
      <BrandLockup compact />
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Abrir alertas"
          onClick={onAlerts}
          className="relative flex size-11 items-center justify-center rounded-full border border-[#0b5e96]/55 bg-[#03111d]/80"
        >
          <Bell className="samuel-neon-icon size-5 text-[#cbe9ff]" />
          {alertCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              {Math.min(alertCount, 9)}
            </span>
          )}
        </button>
        <Link
          href="/empresas"
          className="flex size-11 items-center justify-center rounded-full border border-[#078aff] bg-[#03111d]/80 text-sm text-white"
        >
          SF
        </Link>
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={onMenu}
          className="flex size-11 items-center justify-center rounded-full border border-[#0b5e96]/55 bg-[#03111d]/80"
        >
          <Menu className="size-5" />
        </button>
      </div>
    </header>
  );
}

function CinematicBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,131,255,.22),transparent_26%),radial-gradient(circle_at_50%_73%,rgba(0,104,214,.11),transparent_32%),linear-gradient(180deg,#03101b_0%,#020a13_46%,#01060c_100%)]" />
      <div className="samuel-tunnel-ring absolute left-1/2 top-[44%] aspect-square w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0d6dad]/16" />
      <div className="samuel-tunnel-ring samuel-tunnel-ring-b absolute left-1/2 top-[44%] aspect-square w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1687d3]/14" />
      <div className="samuel-light-beam left-[4%] rotate-[8deg]" />
      <div className="samuel-light-beam left-[11%] rotate-[4deg] [animation-delay:-2.3s]" />
      <div className="samuel-light-beam right-[5%] -rotate-[8deg] [animation-delay:-4.7s]" />
      <div className="samuel-light-beam right-[12%] -rotate-[4deg] [animation-delay:-1.1s]" />
      <div className="absolute bottom-[5%] left-[2%] right-[2%] h-[130px] bg-[linear-gradient(176deg,transparent_31%,rgba(42,142,255,.12)_45%,transparent_50%),linear-gradient(184deg,transparent_32%,rgba(81,205,255,.09)_46%,transparent_53%)] blur-md" />
      <div className="samuel-dust absolute inset-0 opacity-35" />
      <div className="absolute inset-0 opacity-[.12] [background-image:linear-gradient(rgba(82,170,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(82,170,255,.035)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
    </div>
  );
}

function LivingCore({ active, phase }: { active: boolean; phase: VoicePhase }) {
  const intensity = active ? "is-live" : "";
  return (
    <div className={`samuel-core relative h-full w-full ${intensity}`} aria-hidden="true">
      <div className="samuel-core-aura absolute inset-[8%] rounded-full bg-[#008cff]/14 blur-[42px]" />
      <div className="samuel-core-aura samuel-core-aura-b absolute inset-[15%] rounded-full bg-[#7b4dff]/16 blur-[38px]" />

      <div className="samuel-core-outer absolute inset-[2%] rounded-full" />
      <div className="samuel-core-orbit samuel-core-orbit-a absolute inset-[5%] rounded-full" />
      <div className="samuel-core-orbit samuel-core-orbit-b absolute inset-[10%] rounded-full" />
      <div className="samuel-core-orbit samuel-core-orbit-c absolute inset-[14%] rounded-full" />

      <div className="samuel-core-sphere absolute inset-[14%] overflow-hidden rounded-full border border-[#60cfff]/60">
        <div className="samuel-core-sphere-gradient absolute inset-0" />
        <div className="samuel-core-sphere-shine absolute inset-[3%] rounded-full" />
        <div className="samuel-core-sphere-grid absolute inset-0 rounded-full" />
      </div>

      <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="samuelBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#35e5ff" />
            <stop offset="45%" stopColor="#0577ff" />
            <stop offset="72%" stopColor="#a667ff" />
            <stop offset="100%" stopColor="#ffb56f" />
          </linearGradient>
          <linearGradient id="samuelCyan" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7d55ff" />
            <stop offset="42%" stopColor="#0bbdff" />
            <stop offset="78%" stopColor="#19f1e0" />
            <stop offset="100%" stopColor="#ffbf7f" />
          </linearGradient>
          <radialGradient id="samuelParticle">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#7be7ff" />
            <stop offset="100%" stopColor="#0288ff" stopOpacity="0" />
          </radialGradient>
          <filter id="samuelGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="samuelSoft" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <g className="samuel-svg-ring samuel-svg-ring-a" opacity=".72">
          <circle cx="260" cy="260" r="226" fill="none" stroke="#0d9cff" strokeWidth="1.2" strokeDasharray="1 10" />
          <circle cx="260" cy="260" r="210" fill="none" stroke="#43cfff" strokeWidth="1" strokeDasharray="42 9 2 12" />
        </g>
        <g className="samuel-svg-ring samuel-svg-ring-b" opacity=".78">
          <circle cx="260" cy="260" r="194" fill="none" stroke="#7457ff" strokeWidth="2" strokeDasharray="55 24 7 18" />
          <circle cx="260" cy="260" r="183" fill="none" stroke="#12cfff" strokeWidth="1.4" strokeDasharray="9 15" />
        </g>

        <g className="samuel-energy-group samuel-energy-a" filter="url(#samuelGlow)">
          <path className="samuel-energy-path" d="M103 256C128 125 274 109 394 172C484 220 435 360 315 392C214 419 111 350 103 256Z" fill="none" stroke="url(#samuelBlue)" strokeWidth="7" strokeLinecap="round" />
          <path className="samuel-energy-path samuel-energy-path-thin" d="M131 177C204 83 372 126 409 228C448 333 307 420 205 361C111 307 76 246 131 177Z" fill="none" stroke="url(#samuelCyan)" strokeWidth="3.4" strokeLinecap="round" />
        </g>
        <g className="samuel-energy-group samuel-energy-b" filter="url(#samuelGlow)">
          <path className="samuel-energy-path" d="M169 113C314 91 426 200 387 329C350 451 184 428 122 322C70 233 88 144 169 113Z" fill="none" stroke="url(#samuelCyan)" strokeWidth="6" strokeLinecap="round" />
          <path className="samuel-energy-path samuel-energy-path-thin" d="M124 278C168 182 294 152 389 207C454 244 423 355 333 391C233 431 145 373 124 278Z" fill="none" stroke="url(#samuelBlue)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="samuel-energy-group samuel-energy-c" filter="url(#samuelSoft)" opacity=".72">
          <path d="M161 130C272 59 432 171 397 307C366 423 185 425 113 321C46 225 81 163 161 130Z" fill="none" stroke="#0bcfff" strokeWidth="8" />
          <path d="M130 242C175 136 304 116 396 188C473 250 411 390 298 407C174 425 93 337 130 242Z" fill="none" stroke="#9c66ff" strokeWidth="7" />
        </g>

        <g className="samuel-particle-field">
          {[
            [162, 143, 4], [208, 121, 3], [251, 128, 2.8], [310, 139, 3.5],
            [358, 169, 3], [385, 218, 2.6], [397, 268, 4], [373, 322, 3],
            [334, 370, 3.6], [281, 391, 2.6], [223, 383, 4], [172, 354, 3],
            [135, 309, 3.2], [119, 259, 2.5], [136, 205, 4], [195, 183, 2.4],
            [236, 177, 3.1], [278, 188, 2.5], [321, 204, 3], [346, 249, 2.5],
            [337, 291, 3.5], [304, 326, 2.5], [258, 340, 3], [214, 325, 2.5],
            [184, 290, 3.3], [177, 247, 2.5], [207, 218, 3], [250, 214, 2.2],
            [287, 231, 3.2], [300, 269, 2.5], [282, 300, 3], [245, 306, 2.3],
            [217, 280, 2.8], [221, 249, 2], [252, 247, 3.2], [269, 271, 2.5],
          ].map(([cx, cy, r], index) => (
            <circle
              key={`${cx}-${cy}`}
              className="samuel-particle"
              cx={cx}
              cy={cy}
              r={r}
              fill="url(#samuelParticle)"
              style={{ animationDelay: `${-(index % 11) * 0.31}s` }}
            />
          ))}
        </g>

        <g className="samuel-cardinal-nodes" filter="url(#samuelGlow)">
          <circle cx="260" cy="34" r="4" fill="#36ddff" />
          <circle cx="486" cy="260" r="4" fill="#7b66ff" />
          <circle cx="260" cy="486" r="4" fill="#24dcff" />
          <circle cx="34" cy="260" r="4" fill="#34ddff" />
        </g>
      </svg>

      <div className={`samuel-core-phase absolute inset-[20%] rounded-full ${phase === "speaking" ? "is-speaking" : phase === "processing" ? "is-thinking" : ""}`} />
    </div>
  );
}

function OrbState({
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
    <div className={`absolute ${className} w-[160px]`}>
      <div className="flex items-center gap-3">
        <span
          className={`samuel-state-icon flex size-12 items-center justify-center rounded-full border ${active ? "is-live" : ""}`}
          style={{ borderColor: `${color}55`, color, boxShadow: `0 0 20px ${color}25` }}
        >
          <Icon className="size-7" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        </span>
      </div>
      <strong className="mt-2 block text-[14px] text-[#e7f3ff]">{title}</strong>
      <p className="mt-2 text-xs leading-5 text-[#a5c4dd]">{text}</p>
    </div>
  );
}

function MobileOrbState({
  className,
  icon: Icon,
  label,
  sub,
  color,
  active,
  align = "left",
}: {
  className: string;
  icon: LucideIcon;
  label: string;
  sub: string;
  color: string;
  active: boolean;
  align?: "left" | "right";
}) {
  return (
    <div className={`absolute z-20 w-[88px] ${className}`}>
      <span
        className={`samuel-state-icon flex size-10 items-center justify-center rounded-full border ${align === "right" ? "ml-auto" : ""} ${active ? "is-live" : ""}`}
        style={{ borderColor: `${color}55`, color, boxShadow: `0 0 16px ${color}22` }}
      >
        <Icon className="size-5" />
      </span>
      <strong className="mt-1 block text-[9px] tracking-[.04em] text-white">{label}</strong>
      <p className="mt-1 text-[8px] leading-3 text-[#9fbfd6]">{sub}</p>
    </div>
  );
}

function VoiceStatusCard({
  title,
  subtitle,
  active,
}: {
  title: string;
  subtitle: string;
  active: boolean;
}) {
  return (
    <div aria-live="polite" className="samuel-neon-card mx-auto mt-1 w-full max-w-[470px] shrink-0 rounded-[28px] border border-[#0c7de5] bg-[#031326]/95 px-5 py-3.5 text-center">
      <div className="flex items-center justify-center gap-4">
        <Activity className={`samuel-neon-icon size-7 text-[#21b5ff] ${active ? "animate-pulse" : ""}`} />
        <div className="min-w-0">
          <strong className="block truncate text-sm text-white">{title}</strong>
          <span className="block truncate text-xs text-[#b9d6ed]">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}

function PrimaryMic({ active, phase }: { active: boolean; phase: VoicePhase }) {
  return (
    <button
      type="button"
      aria-label="Ativar ou desativar voz"
      className="samuel-reference-mic group mx-auto flex min-h-28 min-w-28 touch-manipulation flex-col items-center gap-2 rounded-2xl text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
    >
      <span className={`samuel-mic-ring relative flex size-[96px] items-center justify-center rounded-full border border-[#0d7ef6] bg-[radial-gradient(circle_at_50%_42%,#1164b8_0%,#082d60_45%,#020b16_100%)] ${active ? "is-live" : ""}`}>
        <span className="samuel-mic-orbit absolute inset-[-13px] rounded-full border border-[#1fd5ff]/30" />
        <span className="samuel-mic-orbit samuel-mic-orbit-b absolute inset-[-23px] rounded-full border border-[#227fff]/18" />
        <Mic className="samuel-neon-icon size-10 text-white" />
      </span>
      <span>{phase === "processing" ? "Pensando" : phase === "speaking" ? "Falando" : active ? "Ouvindo" : "Toque para falar"}</span>
    </button>
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
      className="group mx-auto flex min-h-20 min-w-16 touch-manipulation flex-col items-center gap-2 rounded-xl text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
    >
      <span className="samuel-neon-control flex size-[64px] items-center justify-center rounded-full border border-[#0d65ac] bg-[#03101b]/95 transition group-active:scale-95">
        <Icon className="size-6" />
      </span>
      {label}
    </button>
  );
}

function QuickActions({
  actions,
  onAction,
}: {
  actions: Action[];
  onAction: (action: Action) => void;
}) {
  return (
    <div className="mt-4 shrink-0 xl:mt-3">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:grid xl:grid-cols-5 xl:overflow-visible">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onAction(action)}
            className="samuel-action-card flex min-h-[62px] min-w-[162px] items-center justify-center gap-2 rounded-xl border border-[#0a5e9e] bg-[#03101b]/92 px-3 text-[11px] text-white xl:min-w-0"
          >
            <action.icon className="samuel-neon-icon size-5 shrink-0 text-[#1aaaff]" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RightPanel({
  actions,
  onAction,
  alertCount,
  onAlerts,
  voiceActive,
  companyReady,
  copy,
}: {
  actions: Action[];
  onAction: (action: Action) => void;
  alertCount: number;
  onAlerts: () => void;
  voiceActive: boolean;
  companyReady: boolean;
  copy: { title: string; subtitle: string };
}) {
  return (
    <aside className="relative hidden min-h-0 overflow-y-auto bg-[linear-gradient(180deg,#020a11,#02070d)] px-4 pb-5 pt-5 2xl:block [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#0b8ee8]/38 to-transparent" />
      <div className="flex items-center justify-end gap-4">
        <Sun className="samuel-neon-icon size-6 text-[#d9eeff]" />
        <button type="button" onClick={onAlerts} className="relative text-[#cae8ff]">
          <Bell className="samuel-neon-icon size-6" />
          {alertCount > 0 && (
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {Math.min(alertCount, 9)}
            </span>
          )}
        </button>
        <Link href="/empresas" className="flex size-11 items-center justify-center rounded-full border border-[#0f8bff] text-sm text-white shadow-[0_0_18px_rgba(0,139,255,.12)]">
          SF
        </Link>
        <div className="border-l border-white/10 pl-3 text-[10px] leading-5 text-[#bdd8ec]">
          <div>Sempre aprendendo.</div>
          <div>Sempre ao seu lado.</div>
        </div>
      </div>

      <section className="samuel-neon-card mt-5 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4">
        <h2 className="text-[18px] font-semibold text-white">Como posso ajudar você hoje?</h2>
        <p className="mt-2 text-xs leading-5 text-[#b4ccdf]">
          Conte com minha inteligência para transformar suas ideias em resultados reais.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onAction(action)}
              className="samuel-action-card flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-xl border border-[#0a426e] bg-[#051321] p-2 text-center text-[10px] leading-4 text-white"
            >
              <action.icon className="samuel-neon-icon size-7 text-[#20b6ff]" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="samuel-neon-card mt-3 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4">
        <h3 className="text-sm font-semibold text-white">Status em tempo real</h3>
        <div className="mt-3 space-y-2.5 text-xs text-[#bdd3e5]">
          <LiveStatus label={voiceActive ? copy.title : "Pronto para ajudar"} active={voiceActive} />
          <LiveStatus label={voiceActive ? "OpenAI Realtime conectado" : "Voz pronta para conectar"} active={voiceActive} />
          <LiveStatus label="Ferramentas integradas" active />
          <LiveStatus label={companyReady ? "Memória e contexto habilitados" : "Contexto padrão ativo"} active={companyReady} />
          <LiveStatus label="Pronto para executar tarefas" active />
        </div>
      </section>

      <blockquote className="samuel-neon-card mt-3 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-5 text-sm italic leading-6 text-[#c7dcec]">
        “Mais do que uma IA,<br />um parceiro para o seu crescimento.”
        <div className="mt-3 text-right text-xl font-light not-italic text-[#d9edff]">Samuel IA</div>
      </blockquote>
    </aside>
  );
}

function LiveStatus({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={`flex size-4 shrink-0 items-center justify-center rounded-full ${active ? "bg-emerald-400/15" : "bg-white/[.04]"}`}>
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

function MobileContent({
  actions,
  onAction,
  voiceActive,
  companyReady,
  copy,
}: {
  actions: Action[];
  onAction: (action: Action) => void;
  voiceActive: boolean;
  companyReady: boolean;
  copy: { title: string; subtitle: string };
}) {
  return (
    <div className="mt-6 space-y-3 xl:hidden">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onAction(action)}
            className="samuel-action-card flex min-h-[82px] items-center gap-3 rounded-xl border border-[#0a568e] bg-[#031321]/88 p-3 text-left text-[11px]"
          >
            <action.icon className="samuel-neon-icon size-6 shrink-0 text-[#18b5ff]" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
      <section className="samuel-neon-card rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Status em tempo real</h3>
          <span className="flex items-center gap-2 text-[11px] text-emerald-300">
            <span className="samuel-online-dot size-2 rounded-full bg-emerald-400" />
            {voiceActive ? "Voz conectada" : "Pronto"}
          </span>
        </div>
        <div className="mt-3 space-y-2.5 text-xs text-[#b8d2e5]">
          <LiveStatus label={copy.title} active={voiceActive} />
          <LiveStatus label="Ferramentas integradas" active />
          <LiveStatus label={companyReady ? "Memória e contexto habilitados" : "Contexto padrão ativo"} active={companyReady} />
          <LiveStatus label="Pronto para executar tarefas" active />
        </div>
      </section>
      <blockquote className="samuel-neon-card rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4 text-sm italic leading-6 text-[#c7dcec]">
        “Mais do que uma IA, um parceiro para o seu crescimento.”
        <span className="mt-2 block text-right text-lg not-italic text-white">Samuel IA</span>
      </blockquote>
    </div>
  );
}

function MobileBottomNav({
  onNavigate,
  onMore,
}: {
  onNavigate: (section: WorkspaceSection) => void;
  onMore: () => void;
}) {
  const items: Array<{ label: string; icon: LucideIcon; action: () => void; active?: boolean }> = [
    { label: "Início", icon: Home, action: () => onNavigate("samuel-ai"), active: true },
    { label: "Tarefas", icon: ListChecks, action: () => onNavigate("executive-tasks") },
    { label: "Clientes", icon: UsersRound, action: () => onNavigate("crm") },
    { label: "Relatórios", icon: BarChart3, action: () => onNavigate("dashboard") },
    { label: "Mais", icon: Menu, action: onMore },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#0b4774]/60 bg-[#020b13]/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl xl:hidden">
      {items.map(({ label, icon: Icon, action, active }) => (
        <button
          key={label}
          type="button"
          onClick={action}
          className={`relative flex min-h-[66px] flex-col items-center justify-center gap-1 text-[9px] ${active ? "text-[#6ed6ff]" : "text-[#b1cadd]"}`}
        >
          {active && <span className="absolute top-0 h-[3px] w-11 rounded-full bg-[#1db8ff] shadow-[0_0_12px_#00aaff]" />}
          <Icon className={`size-5 ${active ? "samuel-neon-icon" : ""}`} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function MobileDrawer({
  open,
  onClose,
  onNavigate,
  onOpenConversation,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: WorkspaceSection) => void;
  onOpenConversation: () => void;
}) {
  return (
    <div className={`fixed inset-0 z-[120] xl:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside className={`absolute right-0 top-0 h-full w-[min(88vw,360px)] border-l border-[#0b75c7] bg-[#020b13]/98 p-5 pt-[max(1rem,env(safe-area-inset-top))] shadow-[-20px_0_70px_rgba(0,83,160,.2)] transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <BrandLockup compact />
          <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-full border border-[#0b5f99]/60">
            <X className="size-5" />
          </button>
        </div>
        <nav className="mt-6 space-y-1 overflow-y-auto pb-20">
          {MAIN_NAV.map((item) => {
            const Icon = item.icon;
            const classes = "flex min-h-12 w-full items-center gap-3 rounded-xl border border-transparent px-3 text-left text-sm text-[#c5def0] hover:border-[#0a6cab]/50 hover:bg-[#071927]";
            if (item.href)
              return (
                <Link key={item.label} href={item.href} onClick={onClose} className={classes}>
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            return (
              <button
                key={item.label}
                type="button"
                className={classes}
                onClick={() => item.conversation ? onOpenConversation() : item.section && onNavigate(item.section)}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
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
          ? "fixed inset-0 z-[150] flex items-center justify-center bg-black/82 p-0 backdrop-blur-md sm:p-4"
          : "pointer-events-none fixed left-[-10000px] top-0 h-px w-px overflow-hidden opacity-0"
      }
      aria-hidden={!open}
    >
      <div className={open ? "flex h-dvh w-full max-w-5xl flex-col overflow-hidden border border-[#0d78c5] bg-[#03101b] shadow-[0_0_70px_rgba(0,127,255,.28)] sm:h-[min(90dvh,860px)] sm:rounded-3xl" : "h-full w-full"}>
        {open && (
          <div className="flex shrink-0 items-center justify-between border-b border-[#164f78] px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4">
            <div>
              <strong className="block text-base text-white">Conversar com Samuel</strong>
              <span className="mt-1 block text-xs text-[#86abc9]">Voz, texto e execução no mesmo lugar.</span>
            </div>
            <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-[#164f78] px-4 text-sm text-[#b9d9f1] hover:border-[#0d9dff]">
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

function SamuelPixelStyles() {
  return (
    <style jsx global>{`
      @keyframes samuelOrbSpin { to { transform: rotate(360deg); } }
      @keyframes samuelOrbSpinReverse { to { transform: rotate(-360deg); } }
      @keyframes samuelFlow { to { stroke-dashoffset: -120; } }
      @keyframes samuelFloat { 0%,100% { transform: translate3d(0,-2px,0) scale(1); } 50% { transform: translate3d(0,4px,0) scale(1.012); } }
      @keyframes samuelPulse { 0%,100% { opacity:.56; transform:scale(.985); } 50% { opacity:1; transform:scale(1.025); } }
      @keyframes samuelGlowPulse { 0%,100% { filter: drop-shadow(0 0 6px rgba(0,176,255,.5)); } 50% { filter: drop-shadow(0 0 17px rgba(0,210,255,.95)); } }
      @keyframes samuelParticlePulse { 0%,100% { opacity:.25; transform:scale(.65); } 45% { opacity:1; transform:scale(1.75); } }
      @keyframes samuelBeam { 0%,100% { opacity:.18; transform:translateY(-4%) scaleY(.94); } 50% { opacity:.5; transform:translateY(4%) scaleY(1.05); } }
      @keyframes samuelDustDrift { from { background-position:0 0,0 0; } to { background-position:80px 140px,-110px 90px; } }
      @keyframes samuelMicOrbit { to { transform:rotate(360deg); } }
      @keyframes samuelCoreBreath { 0%,100% { box-shadow:0 0 28px rgba(0,153,255,.34), inset 0 0 48px rgba(0,91,255,.18); } 50% { box-shadow:0 0 58px rgba(0,191,255,.62), inset 0 0 72px rgba(69,91,255,.28); } }

      .samuel-pixel-ui .samuel-light-beam {
        position:absolute; top:-8%; bottom:-8%; width:6px;
        background:linear-gradient(180deg,transparent,rgba(67,190,255,.05) 24%,rgba(79,176,255,.32) 52%,rgba(45,135,255,.05) 76%,transparent);
        filter:blur(2px); animation:samuelBeam 6s ease-in-out infinite;
      }
      .samuel-pixel-ui .samuel-tunnel-ring { box-shadow:0 0 80px rgba(0,129,255,.06) inset; animation:samuelPulse 9s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-tunnel-ring-b { animation-delay:-4.5s; }
      .samuel-pixel-ui .samuel-dust {
        background-image:radial-gradient(circle,rgba(142,215,255,.72) 0 1px,transparent 1.7px),radial-gradient(circle,rgba(91,153,255,.42) 0 1px,transparent 1.8px);
        background-size:112px 126px,173px 151px; background-position:0 0,43px 21px;
        mask-image:radial-gradient(circle at 50% 43%,black 0 42%,transparent 83%);
        animation:samuelDustDrift 28s linear infinite;
      }
      .samuel-pixel-ui .samuel-nav-item { transition:border-color .25s ease,background .25s ease,color .25s ease,box-shadow .25s ease,transform .25s ease; }
      .samuel-pixel-ui .samuel-nav-item:hover { transform:translateX(2px); box-shadow:0 0 20px rgba(0,141,255,.09); }
      .samuel-pixel-ui .samuel-nav-item.is-active { box-shadow:0 0 25px rgba(0,123,255,.22),inset 0 0 22px rgba(38,144,255,.08); }
      .samuel-pixel-ui .samuel-neon-card { box-shadow:0 0 22px rgba(0,111,210,.08),inset 0 0 24px rgba(0,88,174,.035); }
      .samuel-pixel-ui .samuel-neon-icon { animation:samuelGlowPulse 3.6s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-online-dot { box-shadow:0 0 8px rgba(50,255,126,.9),0 0 20px rgba(50,255,126,.45); animation:samuelPulse 2.2s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-action-card { transition:transform .24s ease,border-color .24s ease,background .24s ease,box-shadow .24s ease; }
      .samuel-pixel-ui .samuel-action-card:hover { transform:translateY(-2px); border-color:#159ff1; background:#061827; box-shadow:0 0 24px rgba(0,153,255,.16),inset 0 0 18px rgba(0,123,255,.055); }
      .samuel-pixel-ui .samuel-neon-control { box-shadow:0 0 14px rgba(0,126,217,.08); }
      .samuel-pixel-ui .samuel-neon-control:hover { border-color:#27baff; box-shadow:0 0 25px rgba(0,177,255,.22); }

      .samuel-pixel-ui .samuel-core { animation:samuelFloat 7s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-core-aura { animation:samuelPulse 4.2s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-core-aura-b { animation-delay:-2.1s; }
      .samuel-pixel-ui .samuel-core-outer {
        border:1px solid rgba(67,200,255,.18);
        background:repeating-conic-gradient(from 0deg,rgba(33,180,255,.75) 0deg 1deg,transparent 1deg 7deg);
        mask-image:radial-gradient(circle,transparent 78%,black 79%);
        animation:samuelOrbSpin 36s linear infinite;
        filter:drop-shadow(0 0 8px rgba(0,157,255,.45));
      }
      .samuel-pixel-ui .samuel-core-orbit { border:1px solid rgba(69,201,255,.22); }
      .samuel-pixel-ui .samuel-core-orbit-a { border-top-color:#20cbff;border-right-color:#087cff;animation:samuelOrbSpin 16s linear infinite;box-shadow:0 0 16px rgba(0,167,255,.16); }
      .samuel-pixel-ui .samuel-core-orbit-b { border-bottom-color:#926cff;border-left-color:#21e2ff;animation:samuelOrbSpinReverse 23s linear infinite; }
      .samuel-pixel-ui .samuel-core-orbit-c { border-top-color:#4fe9ff;border-bottom-color:#734cff;animation:samuelOrbSpin 31s linear infinite;opacity:.62; }
      .samuel-pixel-ui .samuel-core-sphere { animation:samuelCoreBreath 4.8s ease-in-out infinite; background:#020b1b; }
      .samuel-pixel-ui .samuel-core-sphere-gradient {
        inset:-16%;
        background:conic-gradient(from 30deg,#0f52ff 0 15%,#14d7ff 23%,#02a3ff 36%,#7d4eff 50%,#ffbc79 65%,#316cff 79%,#16f0df 91%,#0f52ff 100%);
        opacity:.46; filter:blur(18px) saturate(1.5); animation:samuelOrbSpin 13s linear infinite;
      }
      .samuel-pixel-ui .samuel-core-sphere-shine { background:radial-gradient(circle at 34% 27%,rgba(255,255,255,.2),transparent 14%),radial-gradient(circle at center,transparent 40%,rgba(0,160,255,.12) 72%,rgba(0,31,71,.75)); }
      .samuel-pixel-ui .samuel-core-sphere-grid { background-image:radial-gradient(circle,rgba(168,232,255,.75) 0 1px,transparent 1.5px);background-size:19px 19px;mask-image:radial-gradient(circle,black,transparent 83%);opacity:.5;animation:samuelOrbSpinReverse 48s linear infinite; }
      .samuel-pixel-ui .samuel-svg-ring-a { transform-origin:260px 260px; animation:samuelOrbSpin 42s linear infinite; }
      .samuel-pixel-ui .samuel-svg-ring-b { transform-origin:260px 260px; animation:samuelOrbSpinReverse 25s linear infinite; }
      .samuel-pixel-ui .samuel-energy-group { transform-origin:260px 260px; }
      .samuel-pixel-ui .samuel-energy-a { animation:samuelOrbSpin 14s linear infinite; }
      .samuel-pixel-ui .samuel-energy-b { animation:samuelOrbSpinReverse 19s linear infinite; }
      .samuel-pixel-ui .samuel-energy-c { animation:samuelPulse 5s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-energy-path { stroke-dasharray:26 7 9 5; stroke-dashoffset:0; animation:samuelFlow 4.8s linear infinite; }
      .samuel-pixel-ui .samuel-energy-path-thin { stroke-dasharray:11 5 3 7; animation-duration:3.7s; animation-direction:reverse; }
      .samuel-pixel-ui .samuel-particle { transform-box:fill-box; transform-origin:center; animation:samuelParticlePulse 3.1s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-cardinal-nodes circle { animation:samuelGlowPulse 2.8s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-core.is-live .samuel-core-aura { opacity:1; filter:blur(34px); }
      .samuel-pixel-ui .samuel-core.is-live .samuel-energy-path { animation-duration:2.8s; }
      .samuel-pixel-ui .samuel-core-phase { border:1px solid rgba(0,198,255,.08);box-shadow:inset 0 0 45px rgba(0,157,255,.08);animation:samuelPulse 4s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-core-phase.is-thinking { border-color:rgba(181,106,255,.24);box-shadow:inset 0 0 55px rgba(138,79,255,.14),0 0 35px rgba(117,79,255,.11); }
      .samuel-pixel-ui .samuel-core-phase.is-speaking { border-color:rgba(255,182,122,.24);box-shadow:inset 0 0 55px rgba(255,153,74,.1),0 0 35px rgba(255,153,74,.09); }
      .samuel-pixel-ui .samuel-state-icon { transition:transform .25s ease,box-shadow .25s ease; }
      .samuel-pixel-ui .samuel-state-icon.is-live { transform:scale(1.06); animation:samuelGlowPulse 2.1s ease-in-out infinite; }
      .samuel-pixel-ui .samuel-mic-ring { box-shadow:0 0 0 8px rgba(0,116,255,.1),0 0 36px rgba(0,152,255,.58),inset 0 0 26px rgba(0,172,255,.16); }
      .samuel-pixel-ui .samuel-mic-ring.is-live { box-shadow:0 0 0 8px rgba(0,139,255,.15),0 0 55px rgba(0,202,255,.78),inset 0 0 38px rgba(0,172,255,.28); }
      .samuel-pixel-ui .samuel-mic-orbit { border-top-color:#35dbff;border-right-color:#137cff;animation:samuelMicOrbit 4.7s linear infinite; }
      .samuel-pixel-ui .samuel-mic-orbit-b { animation-duration:8.4s;animation-direction:reverse;border-left-color:#5c73ff; }

      @media (max-width:1279px) {
        .samuel-pixel-ui .samuel-core { animation-duration:8.5s; }
      }
      @media (prefers-reduced-motion:reduce) {
        .samuel-pixel-ui *, .samuel-pixel-ui *::before, .samuel-pixel-ui *::after { animation-duration:.001ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; }
      }
    `}</style>
  );
}
