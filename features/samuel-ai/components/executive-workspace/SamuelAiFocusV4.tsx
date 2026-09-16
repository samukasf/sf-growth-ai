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
  Sun,
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

type VoiceStateDetail = { phase?: VoicePhase; active?: boolean };

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
      "Crie uma proposta comercial profissional. Use o contexto da empresa e peça somente os dados indispensáveis que faltarem.",
  },
  { label: "Agendar tarefa", icon: CalendarDays, section: "executive-agenda" },
];

function phaseCopy(phase: VoicePhase, processing: boolean) {
  if (phase === "connecting") {
    return { title: "Abrindo o microfone...", subtitle: "Autorize o acesso para começar" };
  }
  if (phase === "listening") {
    return { title: "Estou ouvindo...", subtitle: "Fale naturalmente em português" };
  }
  if (phase === "processing" || processing) {
    return { title: "Estou pensando...", subtitle: "Analisando e conectando ideias" };
  }
  if (phase === "speaking") {
    return { title: "Estou falando...", subtitle: "Respondendo para você" };
  }
  if (phase === "error") {
    return { title: "Falha no modo de voz", subtitle: "Toque novamente para tentar" };
  }
  return { title: "Pronto para ajudar", subtitle: "Toque no microfone ou escreva" };
}

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  );
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function SamuelAiFocusV4({ data, handlers, onNavigate }: Props) {
  const companyId = data.executiveContext?.company.id ?? "default-company";
  const [conversationOpen, setConversationOpen] = useState(false);
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
    const timer = window.setTimeout(syncInitial, 80);

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
      const textarea = cockpit?.querySelector<HTMLTextAreaElement>(".samuel-chat-textarea");
      if (!textarea) return;
      setNativeTextareaValue(textarea, clean);
      window.setTimeout(() => {
        const send = cockpit?.querySelector<HTMLButtonElement>(
          ".samuel-chat-send:not(.is-cancel)",
        );
        if (send && !send.disabled) send.click();
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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const copy = phaseCopy(voicePhase, handlers.isProcessing);

  return (
    <section className="samuel-focus-cockpit relative h-dvh w-full min-w-0 overflow-hidden bg-[#02070c] text-[#dcecff]">
      <span hidden data-samuel-company-id={companyId} />
      <SamuelVoiceReliabilityBridge />
      <ConversationLayer
        open={conversationOpen}
        onClose={() => setConversationOpen(false)}
        companyId={companyId}
        handlers={handlers}
      />

      <div className="relative z-10 grid h-full min-h-0 min-w-0 grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] 2xl:grid-cols-[287px_minmax(0,1fr)_368px]">
        <DesktopSidebar
          onNavigate={onNavigate}
          onOpenConversation={() => setConversationOpen(true)}
        />

        <main className="relative min-h-0 min-w-0 overflow-y-auto border-cyan-300/10 xl:border-l 2xl:border-r 2xl:overflow-hidden">
          <CinematicBackdrop />
          <MobileHeader
            alertCount={alertCount}
            onAlerts={() => onNavigate("executive-alerts")}
          />

          <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1040px] flex-col px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 xl:h-full xl:max-w-none xl:px-5 xl:pb-3 xl:pt-4 2xl:px-7">
            <header className="shrink-0 text-center">
              <p className="text-[8px] font-medium uppercase tracking-[.34em] text-[#a9c9e4] sm:text-[9px] sm:tracking-[.42em]">
                Mais ideias. Mais ações. Mais resultados.
              </p>
              <h1 className="mt-2 text-[clamp(2.15rem,8vw,3.4rem)] font-semibold leading-none tracking-[.09em] text-[#e2efff] drop-shadow-[0_0_18px_rgba(133,194,255,.18)] xl:text-[clamp(2.8rem,4vw,4.2rem)]">
                SAMUEL IA
              </h1>
              <p className="mt-2 text-[9px] uppercase tracking-[.28em] text-[#a9cae6] sm:text-[10px] sm:tracking-[.45em]">
                — Seu assistente inteligente —
              </p>
            </header>

            <section className="relative mt-3 shrink-0 xl:mt-1 xl:min-h-0 xl:flex-1">
              <div className="hidden xl:block">
                <OrbState
                  className="left-[7%] top-[17%]"
                  icon={Activity}
                  title="OUVINDO"
                  text={<>Captando<br />e entendendo...</>}
                  color="#35d9ff"
                  active={voicePhase === "listening"}
                />
                <OrbState
                  className="right-[5%] top-[17%]"
                  icon={BrainCircuit}
                  title="PENSANDO"
                  text={<>Analisando e<br />conectando ideias...</>}
                  color="#bd73ff"
                  active={voicePhase === "processing" || handlers.isProcessing}
                />
                <OrbState
                  className="bottom-[10%] left-[7%]"
                  icon={Settings}
                  title="EXECUTANDO"
                  text={<>Colocando em<br />prática...</>}
                  color="#66ffd5"
                  active={handlers.isProcessing}
                />
                <OrbState
                  className="bottom-[10%] right-[5%]"
                  icon={MessageSquareText}
                  title="FALANDO"
                  text={<>Respondendo<br />para você...</>}
                  color="#ffc89d"
                  active={voicePhase === "speaking"}
                />
              </div>

              <div className="relative mx-auto size-[min(78vw,360px)] sm:size-[min(62vw,410px)] xl:absolute xl:left-1/2 xl:top-1/2 xl:size-[min(51vh,510px)] xl:-translate-x-1/2 xl:-translate-y-1/2 2xl:size-[min(49vh,500px)]">
                <ReferenceOrb active={voiceActive || handlers.isProcessing} />
              </div>
            </section>

            <div className="mx-auto mt-3 grid w-full max-w-md grid-cols-2 gap-2 xl:hidden">
              <MobileState icon={Activity} label="Ouvindo" color="#35d9ff" active={voicePhase === "listening"} />
              <MobileState icon={BrainCircuit} label="Pensando" color="#bd73ff" active={voicePhase === "processing" || handlers.isProcessing} />
              <MobileState icon={Settings} label="Executando" color="#66ffd5" active={handlers.isProcessing} />
              <MobileState icon={MessageSquareText} label="Falando" color="#ffc89d" active={voicePhase === "speaking"} />
            </div>

            <VoiceStatusCard title={copy.title} subtitle={copy.subtitle} active={voiceActive} />

            <div className="mx-auto mt-3 grid w-full max-w-[610px] shrink-0 grid-cols-[1fr_1.35fr_1fr] items-start gap-4 text-center sm:gap-8">
              <RoundControl icon={Keyboard} label="Digitar" onClick={() => setConversationOpen(true)} />
              <PrimaryMic active={voiceActive} phase={voicePhase} />
              <RoundControl icon={Square} label="Encerrar" onClick={stopSamuel} />
            </div>

            <QuickActions actions={QUICK_ACTIONS} onAction={runAction} />
            <MobilePanels
              actions={RIGHT_ACTIONS}
              onAction={runAction}
              phaseCopy={copy}
              companyReady={companyId !== "default-company"}
              voiceActive={voiceActive}
            />

            <footer className="mt-auto hidden h-10 shrink-0 items-center justify-between border-t border-[#0b456d]/45 px-1 pt-2 text-[8px] uppercase tracking-[.23em] text-[#8caac4] xl:flex">
              <span><strong className="text-white">SF GROWTH AI</strong> · Automação · Resultados · Liberdade</span>
              <span className="hidden 2xl:inline">Transformando ideias em realidade</span>
            </footer>
          </div>
        </main>

        <RightPanel
          actions={RIGHT_ACTIONS}
          onAction={runAction}
          alertCount={alertCount}
          onAlerts={() => onNavigate("executive-alerts")}
          phaseCopy={copy}
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

function CinematicBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_37%,rgba(0,118,255,.22),transparent_27%),radial-gradient(circle_at_16%_57%,rgba(0,177,255,.08),transparent_26%),radial-gradient(circle_at_84%_56%,rgba(101,72,255,.10),transparent_24%),linear-gradient(180deg,#03101c_0%,#020913_48%,#01050a_100%)]" />
      <div className="absolute inset-y-0 left-[7%] w-[6px] rotate-[8deg] bg-gradient-to-b from-transparent via-cyan-200/10 to-transparent blur-[2px]" />
      <div className="absolute inset-y-0 left-[14%] w-[3px] rotate-[4deg] bg-gradient-to-b from-transparent via-blue-300/10 to-transparent blur-[1px]" />
      <div className="absolute inset-y-0 right-[9%] w-[5px] -rotate-[7deg] bg-gradient-to-b from-transparent via-blue-300/10 to-transparent blur-[2px]" />
      <div className="absolute inset-y-0 right-[16%] w-[2px] -rotate-[4deg] bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent" />
      <div className="absolute bottom-[6%] left-[3%] right-[3%] h-[70px] bg-[linear-gradient(175deg,transparent_35%,rgba(39,128,255,.08)_47%,transparent_52%),linear-gradient(185deg,transparent_28%,rgba(73,190,255,.07)_47%,transparent_55%)] blur-sm" />
      <div className="absolute left-[9%] top-[17%] size-3 rounded-full bg-cyan-100/20 blur-[2px]" />
      <div className="absolute bottom-[22%] left-[17%] size-2 rounded-full bg-blue-300/35 blur-[1px]" />
      <div className="absolute right-[9%] top-[23%] size-3 rounded-full bg-violet-200/25 blur-[2px]" />
      <div className="absolute inset-0 opacity-[.16] [background-image:linear-gradient(rgba(90,170,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(90,170,255,.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
    </div>
  );
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`relative shrink-0 ${compact ? "size-11" : "size-14"}`}>
        <Image src="/brand/samuel-s-reference.svg" alt="Samuel IA" fill sizes={compact ? "44px" : "56px"} className="object-contain" priority />
      </div>
      <div className="min-w-0">
        <div className={`${compact ? "text-[15px]" : "text-[19px]"} truncate font-medium tracking-[.13em] text-[#d5ecff]`}>SAMUEL IA</div>
        <div className="mt-1 truncate text-[8px] font-semibold tracking-[.23em] text-[#9ac9e7]">SF GROWTH AI</div>
      </div>
    </div>
  );
}

function DesktopSidebar({ onNavigate, onOpenConversation }: { onNavigate: (section: WorkspaceSection) => void; onOpenConversation: () => void }) {
  return (
    <aside className="hidden min-h-0 flex-col border-r border-cyan-300/10 bg-[linear-gradient(180deg,#03101a,#02080e)] px-5 pb-4 pt-5 xl:flex">
      <BrandLockup />
      <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MAIN_NAV.map((item, index) => {
          const Icon = item.icon;
          const content = <><Icon className="size-[20px] shrink-0" /><span className="truncate">{item.label}</span></>;
          const classes = `flex min-h-[48px] w-full items-center gap-4 rounded-xl border px-4 text-left text-[14px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${index === 0 ? "border-[#087cf5] bg-[linear-gradient(90deg,rgba(14,79,159,.76),rgba(6,37,79,.78))] font-semibold text-white shadow-[0_0_22px_rgba(0,121,255,.14)]" : "border-transparent text-[#b9d7ef] hover:border-cyan-300/15 hover:bg-cyan-300/[.04] hover:text-white"}`;
          if (item.href) return <Link key={item.label} href={item.href} className={classes}>{content}</Link>;
          return <button key={item.label} type="button" className={classes} onClick={() => item.conversation ? onOpenConversation() : item.section && onNavigate(item.section)}>{content}</button>;
        })}
      </nav>
      <div className="mt-3 rounded-2xl border border-[#0b6db5]/60 bg-[#03101b]/95 p-4 shadow-[0_0_30px_rgba(0,91,168,.08)]">
        <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#32ff7e] shadow-[0_0_12px_rgba(50,255,126,.8)]" /><strong className="text-sm text-white">Samuel Online</strong><Activity className="ml-auto size-5 text-[#1ba9ff]" /></div>
        <p className="mt-2 text-[10px] leading-5 text-[#aac7dd]">Voz natural, contexto empresarial e execução supervisionada.</p>
        <div className="mt-2 flex gap-3 text-[9px] text-[#7fb8de]"><button type="button" onClick={() => onNavigate("whatsapp")} className="hover:text-white">WhatsApp</button><Link href="/samuel-ai/desktop" className="hover:text-white">Meu computador</Link></div>
      </div>
      <blockquote className="px-3 pb-1 pt-5 text-[12px] italic leading-5 text-[#a8c3d7]">“Disciplina hoje,<br />resultados amanhã.”<br /><span className="text-[#d8ebfa]">— Samuel IA</span></blockquote>
    </aside>
  );
}

function MobileHeader({ alertCount, onAlerts }: { alertCount: number; onAlerts: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex min-h-[64px] items-center justify-between border-b border-white/[.06] bg-[#020a12]/88 px-4 pb-2 pt-[max(.5rem,env(safe-area-inset-top))] backdrop-blur-2xl xl:hidden">
      <BrandLockup compact />
      <button type="button" aria-label="Abrir alertas" onClick={onAlerts} className="relative flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[.025]"><Bell className="size-5 text-white/75" />{alertCount > 0 && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">{Math.min(alertCount, 9)}</span>}</button>
    </header>
  );
}

function RightPanel({ actions, onAction, alertCount, onAlerts, phaseCopy, companyReady, voiceActive }: { actions: Action[]; onAction: (action: Action) => void; alertCount: number; onAlerts: () => void; phaseCopy: { title: string; subtitle: string }; companyReady: boolean; voiceActive: boolean }) {
  return (
    <aside className="hidden min-h-0 overflow-y-auto bg-[linear-gradient(180deg,#020a11,#02080e)] px-4 pb-5 pt-5 2xl:block [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center justify-end gap-4"><Sun className="size-6 text-[#d7edff]" /><button type="button" onClick={onAlerts} className="relative text-[#c9e6ff]"><Bell className="size-6" />{alertCount > 0 && <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">{Math.min(alertCount, 9)}</span>}</button><Link href="/empresas" className="flex size-11 items-center justify-center rounded-full border border-[#0f8bff] text-sm text-white">SF</Link><div className="border-l border-white/10 pl-3 text-[10px] leading-5 text-[#bdd8ec]"><div>Sempre aprendendo.</div><div>Sempre ao seu lado.</div></div></div>

      <section className="mt-5 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4 shadow-[0_0_35px_rgba(0,104,204,.06)]">
        <h2 className="text-[18px] font-semibold text-white">Como posso ajudar você hoje?</h2>
        <p className="mt-2 text-xs leading-5 text-[#b2cadf]">Conte com minha inteligência para transformar suas ideias em resultados reais.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">{actions.map((action) => <button key={action.label} type="button" onClick={() => onAction(action)} className="flex min-h-[106px] flex-col items-center justify-center gap-2 rounded-xl border border-[#0a426e] bg-[#051321] p-3 text-center text-[11px] text-white transition hover:border-[#0c9cff] hover:bg-[#071a2b]"><action.icon className="size-7 text-[#20b6ff] drop-shadow-[0_0_9px_rgba(24,170,255,.55)]" /><span>{action.label}</span></button>)}</div>
      </section>

      <section className="mt-3 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4"><h3 className="text-sm font-semibold text-white">Status em tempo real</h3><div className="mt-3 space-y-2.5 text-xs text-[#bdd3e5]"><LiveStatus label={phaseCopy.title} active={voiceActive} /><LiveStatus label="Interface pronta" active /><LiveStatus label="Voz natural disponível" active /><LiveStatus label="Ferramentas integradas" active /><LiveStatus label={companyReady ? "Memória e contexto habilitados" : "Contexto padrão ativo"} active={companyReady} /><LiveStatus label="Pronto para executar tarefas" active /></div></section>

      <blockquote className="mt-3 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-5 text-sm italic leading-6 text-[#c7dcec]">“Mais do que uma IA,<br />um parceiro para o seu crescimento.”<div className="mt-3 text-right text-lg not-italic text-[#d9edff]">Samuel IA</div></blockquote>
    </aside>
  );
}

function ReferenceOrb({ active }: { active: boolean }) {
  return (
    <div className={`relative h-full w-full rounded-full transition-transform duration-500 ${active ? "scale-[1.025]" : ""}`}>
      <div className={`absolute inset-[7%] rounded-full bg-cyan-300/10 blur-3xl transition-opacity ${active ? "opacity-100" : "opacity-60"}`} />
      <div className="absolute inset-[3%] animate-[spin_28s_linear_infinite] rounded-full border border-cyan-200/10 [background:repeating-conic-gradient(from_0deg,rgba(0,174,255,.55)_0deg_1deg,transparent_1deg_8deg)] [mask-image:radial-gradient(circle,transparent_73%,black_74%)] motion-reduce:animate-none" />
      <div className="absolute inset-[9%] animate-[spin_19s_linear_infinite_reverse] rounded-full border border-violet-300/10 [background:repeating-conic-gradient(from_20deg,rgba(139,92,246,.45)_0deg_1.3deg,transparent_1.3deg_12deg)] [mask-image:radial-gradient(circle,transparent_77%,black_78%)] motion-reduce:animate-none" />
      <Image src="/brand/samuel-orb-reference.svg" alt="" fill sizes="(max-width: 1280px) 360px, 510px" className="object-contain drop-shadow-[0_0_30px_rgba(0,163,255,.32)]" priority />
    </div>
  );
}

function OrbState({ className, icon: Icon, title, text, color, active }: { className: string; icon: LucideIcon; title: string; text: ReactNode; color: string; active: boolean }) {
  return <div className={`absolute ${className} w-[155px]`}><div className="flex items-center gap-2"><Icon className="size-8" style={{ color, filter: `drop-shadow(0 0 10px ${color})` }} />{active && <span className="size-2 animate-pulse rounded-full bg-emerald-400" />}</div><strong className="mt-2 block text-[14px] text-[#e3f0ff]">{title}</strong><p className="mt-2 text-xs leading-5 text-[#a2c3dd]">{text}</p></div>;
}

function VoiceStatusCard({ title, subtitle, active }: { title: string; subtitle: string; active: boolean }) {
  return <div className="mx-auto mt-2 w-full max-w-[415px] shrink-0 rounded-[28px] border border-[#0d7ae8] bg-[#031326]/95 px-5 py-3 text-center shadow-[0_0_28px_rgba(0,101,255,.13)]"><div className="flex items-center justify-center gap-4"><Activity className={`size-7 text-[#1bafff] ${active ? "animate-pulse" : ""}`} /><div className="min-w-0"><strong className="block truncate text-sm text-white">{title}</strong><span className="block truncate text-xs text-[#b6d3eb]">{subtitle}</span></div></div></div>;
}

function PrimaryMic({ active, phase }: { active: boolean; phase: VoicePhase }) {
  return <button type="button" className="samuel-reference-mic group mx-auto flex min-h-28 min-w-28 touch-manipulation flex-col items-center gap-2 rounded-2xl text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"><span className="relative flex size-[94px] items-center justify-center rounded-full border border-[#0c78f4] bg-[radial-gradient(circle,#0b4b9b_0%,#07234a_50%,#020b16_100%)] shadow-[0_0_0_8px_rgba(0,116,255,.10),0_0_34px_rgba(0,152,255,.55)] transition-transform group-active:scale-95"><span className={`absolute inset-[-11px] rounded-full border border-cyan-300/20 ${active ? "animate-ping" : "animate-pulse"}`} /><span className="absolute inset-[-20px] rounded-full border border-blue-400/10" /><Mic className="size-10 text-white drop-shadow-[0_0_13px_#00a9ff]" /></span><span>{phase === "processing" ? "Pensando" : phase === "speaking" ? "Falando" : active ? "Ouvindo" : "Toque para falar"}</span></button>;
}

function RoundControl({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group mx-auto flex min-h-20 min-w-16 touch-manipulation flex-col items-center gap-2 rounded-xl text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"><span className="flex size-[64px] items-center justify-center rounded-full border border-[#0d65ac] bg-[#03101b]/95 transition group-hover:border-[#2aaeff] group-active:scale-95"><Icon className="size-6" /></span>{label}</button>;
}

function QuickActions({ actions, onAction }: { actions: Action[]; onAction: (action: Action) => void }) {
  return <div className="mt-4 shrink-0 xl:mt-3"><div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:grid xl:grid-cols-5 xl:overflow-visible">{actions.map((action) => <button key={action.label} type="button" onClick={() => onAction(action)} className="flex min-h-[58px] min-w-[155px] items-center justify-center gap-2 rounded-xl border border-[#0b5d9d] bg-[#03101b]/92 px-3 text-[11px] text-white transition hover:border-[#119dff] hover:bg-[#061a2c] xl:min-w-0"><action.icon className="size-5 shrink-0 text-[#179dff]" /><span>{action.label}</span></button>)}</div></div>;
}

function MobileState({ icon: Icon, label, color, active }: { icon: LucideIcon; label: string; color: string; active: boolean }) {
  return <div className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 ${active ? "border-cyan-300/45 bg-cyan-300/[.08]" : "border-white/[.07] bg-white/[.025]"}`}><Icon className="size-[18px]" style={{ color, filter: `drop-shadow(0 0 8px ${color})` }} /><span className="truncate text-[11px] font-semibold">{label}</span>{active && <span className="ml-auto size-2 animate-pulse rounded-full bg-emerald-400" />}</div>;
}

function LiveStatus({ label, active = false }: { label: string; active?: boolean }) {
  return <div className="flex min-w-0 items-center gap-2"><span className={`flex size-4 shrink-0 items-center justify-center rounded-full ${active ? "bg-emerald-400/15" : "bg-white/[.04]"}`}>{active ? <Check className="size-3 text-emerald-400" /> : <span className="size-1.5 rounded-full bg-white/30" />}</span><span className="min-w-0 truncate">{label}</span></div>;
}

function MobilePanels({ actions, onAction, phaseCopy, companyReady, voiceActive }: { actions: Action[]; onAction: (action: Action) => void; phaseCopy: { title: string; subtitle: string }; companyReady: boolean; voiceActive: boolean }) {
  return <div className="mt-6 grid gap-3 xl:grid-cols-2 2xl:hidden"><section className="rounded-2xl border border-[#0b568e] bg-[#03101b]/78 p-4 backdrop-blur-xl"><h2 className="text-sm font-semibold text-white">Como posso ajudar você hoje?</h2><p className="mt-1 text-[11px] leading-5 text-[#9fbfd7]">Acesso rápido às principais ferramentas.</p><div className="mt-3 grid grid-cols-2 gap-2">{actions.map((action) => <button key={action.label} type="button" onClick={() => onAction(action)} className="flex min-h-[74px] items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left text-[11px]"><action.icon className="size-5 shrink-0 text-[#1cb4ff]" /><span>{action.label}</span></button>)}</div></section><section className="rounded-2xl border border-[#0b568e] bg-[#03101b]/78 p-4 backdrop-blur-xl"><h3 className="text-sm font-semibold text-white">Status em tempo real</h3><div className="mt-3 space-y-2.5 text-xs text-[#aecce2]"><LiveStatus label={phaseCopy.title} active={voiceActive} /><LiveStatus label="Interface pronta" active /><LiveStatus label="Voz natural disponível" active /><LiveStatus label="Ferramentas integradas" active /><LiveStatus label={companyReady ? "Memória e contexto habilitados" : "Contexto padrão ativo"} active={companyReady} /></div></section></div>;
}

function MobileBottomNav({ onNavigate, onOpenConversation }: { onNavigate: (section: WorkspaceSection) => void; onOpenConversation: () => void }) {
  return <nav aria-label="Navegação principal" className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-5 rounded-[22px] border border-white/[.09] bg-[#07111c]/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,.55)] backdrop-blur-2xl xl:hidden"><MobileNav icon={Home} label="Início" onClick={() => onNavigate("samuel-ai")} /><MobileNav icon={Film} label="Studio" onClick={() => onNavigate("studio")} /><MobileNav icon={Mic} label="Samuel" onClick={onOpenConversation} primary /><MobileNav icon={MonitorUp} label="Computador" onClick={() => window.location.assign("/samuel-ai/desktop")} /><MobileNav icon={MessageCircleMore} label="WhatsApp" onClick={() => onNavigate("whatsapp")} /></nav>;
}

function MobileNav({ icon: Icon, label, onClick, primary = false }: { icon: LucideIcon; label: string; onClick: () => void; primary?: boolean }) {
  return <button type="button" onClick={onClick} className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[8px] ${primary ? "text-cyan-100" : "text-white/45"}`}>{primary && <span className="absolute -top-5 flex size-12 items-center justify-center rounded-full border border-cyan-300/25 bg-[radial-gradient(circle_at_38%_30%,#155e75,#0f2744_58%,#05070b)] shadow-[0_0_28px_rgba(34,211,238,.22)]" />}<Icon className={`relative z-10 ${primary ? "size-5" : "size-4"}`} /><span className="relative z-10 truncate">{label}</span></button>;
}

function ConversationLayer({ open, onClose, companyId, handlers }: { open: boolean; onClose: () => void; companyId: string; handlers: ExecutiveWorkspaceHandlers }) {
  return <div className={open ? "fixed inset-0 z-[150] flex items-center justify-center bg-black/82 p-0 backdrop-blur-md sm:p-4" : "pointer-events-none fixed left-[-10000px] top-0 h-px w-px overflow-hidden opacity-0"} aria-hidden={!open}><div className={open ? "flex h-dvh w-full max-w-5xl flex-col overflow-hidden border border-[#0d78c5] bg-[#03101b] shadow-[0_0_70px_rgba(0,127,255,.28)] sm:h-[min(90dvh,860px)] sm:rounded-3xl" : "h-full w-full"}>{open && <div className="flex shrink-0 items-center justify-between border-b border-[#164f78] px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4"><div><strong className="block text-base text-white">Conversar com Samuel</strong><span className="mt-1 block text-xs text-[#86abc9]">Voz, texto e execução no mesmo lugar.</span></div><button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-[#164f78] px-4 text-sm text-[#b9d9f1] hover:border-[#0d9dff]">Fechar</button></div>}<div className={open ? "min-h-0 flex-1 overflow-hidden" : "h-full w-full"}><ChatPanel key={companyId} initialMessages={EMPTY_CHAT_MESSAGES} companyId={companyId} isProcessing={handlers.isProcessing} onSendMessage={handlers.onSendMessage} onFirstMessage={handlers.onFirstMessage} /></div></div></div>;
}
