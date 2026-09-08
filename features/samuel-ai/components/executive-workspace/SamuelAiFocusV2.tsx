"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  FileText,
  Home,
  Inbox,
  Keyboard,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircleMore,
  MessageSquareText,
  Mic,
  MonitorCog,
  Search,
  Settings,
  Square,
  UserRoundSearch,
  UsersRound,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import { ChatPanel } from "../chat-panel";
import { SamuelVoiceReliabilityBridge } from "../samuel-voice-reliability-bridge";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
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
  prompt?: string;
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
  { label: "Studio IA", icon: WandSparkles, section: "studio" },
  { label: "Configurações", icon: Settings, href: "/integrations" },
];

const RIGHT_ACTIONS: Action[] = [
  { label: "Encontrar clientes", icon: UserRoundSearch, section: "crm" },
  { label: "Analisar empresas", icon: BarChart3, section: "executive-watchers" },
  { label: "Criar sites e apps", icon: FileText, section: "site-builder" },
  { label: "Gerenciar anúncios", icon: Megaphone, section: "marketing" },
  { label: "Abrir e-mails", icon: Mail, section: "gmail" },
  { label: "Abrir agenda", icon: CalendarDays, section: "executive-agenda" },
];

const QUICK_ACTIONS: Action[] = [
  { label: "Clientes", icon: UserRoundSearch, section: "crm" },
  { label: "Analisar empresa", icon: BarChart3, section: "executive-watchers" },
  { label: "Criar site", icon: MonitorCog, section: "site-builder" },
  {
    label: "Gerar proposta",
    icon: FileText,
    prompt: "Crie uma proposta comercial profissional. Use o contexto da empresa e peça somente os dados indispensáveis que faltarem.",
  },
  { label: "Agenda", icon: CalendarDays, section: "executive-agenda" },
];

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function SamuelAiFocusV2({ data, handlers, onNavigate }: Props) {
  const companyId = data.executiveContext?.company.id ?? "default-company";
  const [conversationOpen, setConversationOpen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const alertCount =
    (data.watcherExecutive?.summary.criticalAlerts ?? 0) +
    (data.executiveMonitoring?.alerts.length ?? 0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const mic = document.querySelector<HTMLButtonElement>(".samuel-reference-mic");
      setVoiceActive(mic?.dataset.voiceCaptureState === "recording");
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  const sendThroughSamuel = (message: string) => {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    setConversationOpen(true);
    window.requestAnimationFrame(() => {
      const cockpit = document.querySelector<HTMLElement>(".samuel-focus-cockpit");
      const textarea = cockpit?.querySelector<HTMLTextAreaElement>(".samuel-chat-textarea");
      if (!textarea) return;
      setNativeTextareaValue(textarea, cleanMessage);
      window.setTimeout(() => {
        const sendButton = cockpit?.querySelector<HTMLButtonElement>(".samuel-chat-send:not(.is-cancel)");
        if (sendButton && !sendButton.disabled) sendButton.click();
      }, 0);
    });
  };

  const runAction = (action: Action) => {
    if (action.section) onNavigate(action.section);
    else if (action.prompt) sendThroughSamuel(action.prompt);
  };

  const stopSamuel = () => {
    const mic = document.querySelector<HTMLButtonElement>(".samuel-reference-mic");
    if (mic?.dataset.voiceCaptureState === "recording") mic.click();
    document.querySelector<HTMLButtonElement>(".samuel-chat-send.is-cancel")?.click();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const openNav = (item: NavItem) => {
    if (item.conversation) setConversationOpen(true);
    else if (item.section) onNavigate(item.section);
  };

  return (
    <section className="samuel-focus-cockpit relative h-dvh w-full overflow-hidden bg-[#02070c] text-[#dcecff]">
      <span hidden data-samuel-company-id={companyId} />
      <SamuelVoiceReliabilityBridge />

      <ConversationLayer
        open={conversationOpen}
        onClose={() => setConversationOpen(false)}
        companyId={companyId}
        handlers={handlers}
      />

      <div className="hidden h-full grid-cols-[260px_minmax(0,1fr)_330px] xl:grid">
        <DesktopSidebar onNavigate={onNavigate} onOpenConversation={() => setConversationOpen(true)} />

        <main className="flex min-h-0 flex-col overflow-hidden border-r border-cyan-300/10 bg-[radial-gradient(circle_at_50%_34%,rgba(0,111,255,.18),transparent_30%),linear-gradient(180deg,#03101c,#020912)]">
          <header className="shrink-0 px-6 pb-2 pt-5 text-center">
            <p className="text-[10px] tracking-[.42em] text-[#9fc6e7]">MAIS IDEIAS. MAIS AÇÕES. MAIS RESULTADOS.</p>
            <h1 className="mt-3 text-[clamp(42px,4.2vw,68px)] font-semibold tracking-[.08em] text-[#deedff]">SAMUEL IA</h1>
            <p className="mt-1 text-[13px] tracking-[.45em] text-[#b4d4ef]">— SEU ASSISTENTE INTELIGENTE —</p>
          </header>

          <div className="relative min-h-0 flex-1">
            <StatusPoint className="left-[8%] top-[14%]" icon={Activity} title="OUVINDO" text={<>Captando<br />e entendendo...</>} color="#35d9ff" />
            <StatusPoint className="right-[6%] top-[14%]" icon={BrainCircuit} title="PENSANDO" text={<>Analisando e<br />conectando ideias...</>} color="#bd73ff" />
            <StatusPoint className="bottom-[15%] left-[8%]" icon={Settings} title="EXECUTANDO" text={<>Colocando em<br />prática...</>} color="#66ffd5" />
            <StatusPoint className="bottom-[15%] right-[6%]" icon={MessageSquareText} title="FALANDO" text={<>Respondendo<br />para você...</>} color="#ffc89d" />

            <div className="absolute left-1/2 top-1/2 size-[min(42vh,430px)] -translate-x-1/2 -translate-y-1/2">
              <SamuelCore active={voiceActive || handlers.isProcessing} />
            </div>
          </div>

          <div className="shrink-0 px-5 pb-3">
            <div className="mx-auto max-w-[560px] rounded-[30px] border border-[#0878e9] bg-[#031326]/95 px-5 py-3 text-center shadow-[0_0_26px_rgba(0,101,255,.14)]">
              <div className="flex items-center justify-center gap-4">
                <Activity className={`size-7 text-[#17a8ff] ${voiceActive ? "animate-pulse" : ""}`} />
                <div>
                  <strong className="block text-sm text-white">{voiceActive ? "Estou ouvindo..." : handlers.isProcessing ? "Estou trabalhando..." : "Pronto para ouvir"}</strong>
                  <span className="text-xs text-[#b9d6f0]">{voiceActive ? "Fale naturalmente em português" : "Toque no microfone ou escreva"}</span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-3 grid max-w-[600px] grid-cols-[1fr_1.35fr_1fr] items-start gap-7 text-center">
              <RoundControl icon={Keyboard} label="Digitar" onClick={() => setConversationOpen(true)} />
              <button type="button" aria-label="Toque para falar" className="samuel-reference-mic group mx-auto flex flex-col items-center gap-2 text-xs font-semibold text-white">
                <span className="relative flex size-[96px] items-center justify-center rounded-full border border-[#0b71e6] bg-[radial-gradient(circle,#083671_0%,#051a38_55%,#020b16_100%)] shadow-[0_0_0_8px_rgba(0,116,255,.10),0_0_30px_rgba(0,152,255,.52)] transition group-hover:scale-[1.03]">
                  <span className={`absolute inset-[-11px] rounded-full border border-cyan-300/15 ${voiceActive ? "animate-ping" : "animate-pulse"}`} />
                  <Mic className="size-10 text-white drop-shadow-[0_0_12px_#00a9ff]" />
                </span>
                <span>{voiceActive ? "Ouvindo" : "Toque para falar"}</span>
              </button>
              <RoundControl icon={Square} label="Encerrar" onClick={stopSamuel} />
            </div>

            <div className="mx-auto mt-4 grid max-w-[900px] grid-cols-5 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button key={action.label} type="button" onClick={() => runAction(action)} className="flex min-h-[58px] items-center justify-center gap-2 rounded-xl border border-[#0b5d9d] bg-[#03101b]/90 px-3 text-[11px] text-white transition hover:border-[#119dff] hover:bg-[#061a2c]">
                  <action.icon className="size-5 shrink-0 text-[#179dff]" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <footer className="flex h-10 shrink-0 items-center justify-between border-t border-[#0b456d]/60 bg-[#020a12]/95 px-6 text-[8px] tracking-[.24em] text-[#a9c8e8]">
            <span><strong className="text-white">SF GROWTH AI</strong> · AUTOMAÇÃO · RESULTADOS · LIBERDADE</span>
            <span>TRANSFORMANDO IDEIAS EM REALIDADE</span>
          </footer>
        </main>

        <RightPanel actions={RIGHT_ACTIONS} onAction={runAction} alertCount={alertCount} onAlerts={() => onNavigate("executive-alerts")} />
      </div>

      <MobilePanel
        voiceActive={voiceActive}
        processing={handlers.isProcessing}
        onOpenConversation={() => setConversationOpen(true)}
        onStop={stopSamuel}
        onNavigate={onNavigate}
        onAction={runAction}
      />
    </section>
  );
}

function ConversationLayer({ open, onClose, companyId, handlers }: { open: boolean; onClose: () => void; companyId: string; handlers: ExecutiveWorkspaceHandlers }) {
  return (
    <div className={open ? "absolute inset-0 z-[150] flex items-center justify-center bg-black/78 p-3 backdrop-blur-md" : "absolute left-[-10000px] top-0 h-px w-px overflow-hidden opacity-0 pointer-events-none"} aria-hidden={!open}>
      <div className={open ? "flex h-[min(88dvh,860px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#0d78c5] bg-[#03101b] shadow-[0_0_70px_rgba(0,127,255,.28)]" : "h-full w-full"}>
        {open && (
          <div className="flex shrink-0 items-center justify-between border-b border-[#164f78] px-4 py-3 sm:px-5 sm:py-4">
            <div><strong className="block text-sm text-white sm:text-base">Conversar com Samuel</strong><span className="mt-1 block text-[10px] text-[#86abc9] sm:text-xs">Voz, texto, execução e respostas no mesmo lugar.</span></div>
            <button type="button" onClick={onClose} className="rounded-xl border border-[#164f78] px-3 py-2 text-xs text-[#b9d9f1] hover:border-[#0d9dff]">Fechar</button>
          </div>
        )}
        <div className={open ? "min-h-0 flex-1 overflow-hidden" : "h-full w-full"}>
          <ChatPanel key={companyId} initialMessages={EMPTY_CHAT_MESSAGES} companyId={companyId} isProcessing={handlers.isProcessing} onSendMessage={handlers.onSendMessage} onFirstMessage={handlers.onFirstMessage} />
        </div>
      </div>
    </div>
  );
}

function DesktopSidebar({ onNavigate, onOpenConversation }: { onNavigate: (section: WorkspaceSection) => void; onOpenConversation: () => void }) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-cyan-300/10 bg-[linear-gradient(180deg,#03101a,#02080e)] p-4">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-[#0d8cff] bg-[#06111c] text-2xl font-black italic text-white shadow-[0_0_24px_rgba(0,174,255,.25)]">S</div>
        <div><div className="text-lg tracking-[.12em] text-[#cde8ff]">SAMUEL IA</div><div className="mt-1 text-[9px] font-semibold tracking-[.2em] text-[#8fb9d7]">SF GROWTH AI</div></div>
      </div>
      <nav className="mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {LEFT_NAV.map((item, index) => {
          const content = <><item.icon className="size-[18px] shrink-0" /><span>{item.label}</span></>;
          const classes = `flex min-h-11 w-full items-center gap-4 rounded-xl border px-4 text-left text-sm transition ${index === 0 ? "border-[#087cf5] bg-[linear-gradient(90deg,rgba(10,76,155,.65),rgba(9,35,69,.72))] font-semibold text-white" : "border-transparent text-[#b8d9f6] hover:border-cyan-300/15 hover:bg-cyan-300/[.04] hover:text-white"}`;
          if (item.href) return <Link key={item.label} href={item.href} className={classes}>{content}</Link>;
          return <button key={item.label} type="button" className={classes} onClick={() => item.conversation ? onOpenConversation() : item.section && onNavigate(item.section)}>{content}</button>;
        })}
      </nav>
      <div className="mt-3 rounded-2xl border border-[#0b6db5]/60 bg-[#03101b] p-4"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#2dff83] shadow-[0_0_10px_rgba(45,255,131,.8)]" /><strong className="text-xs text-white">Samuel Online</strong></div><p className="mt-2 text-[10px] leading-5 text-[#9fc3de]">Comando por voz, contexto empresarial e execução supervisionada.</p></div>
    </aside>
  );
}

function RightPanel({ actions, onAction, alertCount, onAlerts }: { actions: Action[]; onAction: (action: Action) => void; alertCount: number; onAlerts: () => void }) {
  return (
    <aside className="min-h-0 overflow-y-auto bg-[linear-gradient(180deg,#020a11,#02080e)] p-4">
      <div className="flex items-center justify-end gap-4"><button type="button" onClick={onAlerts} className="relative text-[#c9e6ff]"><Bell className="size-6" />{alertCount > 0 && <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">{Math.min(alertCount, 9)}</span>}</button><Link href="/empresas" className="flex size-10 items-center justify-center rounded-full border border-[#0f8bff] text-sm text-white">SF</Link></div>
      <section className="mt-5 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4"><h2 className="text-lg font-semibold text-white">Como posso ajudar você hoje?</h2><p className="mt-2 text-xs leading-5 text-[#a9c6de]">Cada atalho abre o painel correspondente. Nada é redirecionado para uma página genérica.</p><div className="mt-4 grid grid-cols-2 gap-2">{actions.map((action) => <button key={action.label} type="button" onClick={() => onAction(action)} className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border border-[#0a426e] bg-[#051321] p-3 text-center text-[11px] text-white transition hover:border-[#0c9cff] hover:bg-[#071a2b]"><action.icon className="size-7 text-[#1cb4ff]" /><span>{action.label}</span></button>)}</div></section>
      <section className="mt-4 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4"><h3 className="text-sm font-semibold">Acesso rápido</h3><div className="mt-3 space-y-2 text-xs text-[#b6d0e5]"><StatusRow label="Google Agenda" onClick={() => onAction({ label: "Agenda", icon: CalendarDays, section: "executive-agenda" })} /><StatusRow label="Gmail" onClick={() => onAction({ label: "Gmail", icon: Mail, section: "gmail" })} /><StatusRow label="WhatsApp Business" onClick={() => onAction({ label: "WhatsApp", icon: MessageCircleMore, section: "whatsapp" })} /><StatusRow label="Sites & Apps" onClick={() => onAction({ label: "Sites", icon: MonitorCog, section: "site-builder" })} /></div></section>
    </aside>
  );
}

function MobilePanel({ voiceActive, processing, onOpenConversation, onStop, onNavigate, onAction }: { voiceActive: boolean; processing: boolean; onOpenConversation: () => void; onStop: () => void; onNavigate: (section: WorkspaceSection) => void; onAction: (action: Action) => void }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[radial-gradient(circle_at_50%_18%,rgba(0,111,255,.2),transparent_32%),linear-gradient(180deg,#03101c,#02070c)] xl:hidden">
      <header className="flex items-center justify-between border-b border-white/[.06] px-4 py-3"><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-xl border border-cyan-300/30 text-lg font-black italic">S</div><div><strong className="block text-sm tracking-[.1em]">SAMUEL IA</strong><span className="text-[8px] tracking-[.18em] text-white/35">SF GROWTH AI</span></div></div><button type="button" onClick={() => onNavigate("executive-alerts")} className="relative"><Bell className="size-5 text-white/60" /></button></header>
      <main className="flex-1 px-4 pb-24 pt-5">
        <div className="text-center"><p className="text-[8px] tracking-[.32em] text-[#9fc6e7]">MAIS AÇÕES. MAIS RESULTADOS.</p><h1 className="mt-2 text-3xl font-semibold tracking-[.08em]">SAMUEL IA</h1></div>
        <div className="relative mx-auto mt-4 size-[260px] max-w-[78vw]"><SamuelCore active={voiceActive || processing} /></div>
        <div className="mx-auto mt-3 max-w-sm rounded-2xl border border-[#0878e9] bg-[#031326] px-4 py-3 text-center"><strong className="text-sm">{voiceActive ? "Estou ouvindo..." : processing ? "Estou trabalhando..." : "Pronto para ajudar"}</strong><p className="mt-1 text-[10px] text-white/40">Fale naturalmente ou abra a conversa.</p></div>
        <div className="mt-5 flex items-start justify-center gap-8"><RoundControl icon={Keyboard} label="Digitar" onClick={onOpenConversation} compact /><button type="button" className="samuel-reference-mic flex flex-col items-center gap-2 text-[10px] font-semibold"><span className="relative flex size-20 items-center justify-center rounded-full border border-[#0b71e6] bg-[radial-gradient(circle,#083671,#020b16)] shadow-[0_0_28px_rgba(0,152,255,.5)]"><span className={`absolute inset-[-8px] rounded-full border border-cyan-300/15 ${voiceActive ? "animate-ping" : "animate-pulse"}`} /><Mic className="size-8" /></span>{voiceActive ? "Ouvindo" : "Falar"}</button><RoundControl icon={Square} label="Parar" onClick={onStop} compact /></div>
        <div className="mt-6 grid grid-cols-2 gap-2">{RIGHT_ACTIONS.map((action) => <button key={action.label} type="button" onClick={() => onAction(action)} className="flex min-h-[78px] items-center gap-3 rounded-2xl border border-[#0a426e] bg-[#051321] p-3 text-left text-xs"><action.icon className="size-6 shrink-0 text-[#1cb4ff]" /><span>{action.label}</span></button>)}</div>
      </main>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-white/[.08] bg-[#07111c]/95 p-2 shadow-2xl backdrop-blur-xl"><MobileNav icon={Home} label="Início" onClick={() => onNavigate("samuel-ai")} /><MobileNav icon={CalendarDays} label="Agenda" onClick={() => onNavigate("executive-agenda")} /><MobileNav icon={Mic} label="Samuel" onClick={onOpenConversation} primary /><MobileNav icon={Mail} label="E-mail" onClick={() => onNavigate("gmail")} /><MobileNav icon={UsersRound} label="CRM" onClick={() => onNavigate("crm")} /></nav>
    </div>
  );
}

function SamuelCore({ active }: { active: boolean }) {
  return (
    <div className={`relative h-full w-full rounded-full ${active ? "scale-[1.02]" : ""} transition-transform duration-500`}>
      <div className="absolute inset-0 animate-[spin_24s_linear_infinite] rounded-full border border-cyan-200/20 [background:repeating-conic-gradient(from_0deg,rgba(0,174,255,.65)_0deg_1.4deg,transparent_1.4deg_10deg)] [mask-image:radial-gradient(circle,transparent_63%,black_64%)]" />
      <div className="absolute inset-[5%] animate-[spin_15s_linear_infinite_reverse] rounded-full border border-blue-300/25 [background:repeating-conic-gradient(from_25deg,rgba(77,132,255,.55)_0deg_2deg,transparent_2deg_15deg)] [mask-image:radial-gradient(circle,transparent_70%,black_71%)]" />
      <div className="absolute inset-[10%] rounded-full bg-[conic-gradient(from_210deg,#07c8ff,#0a65ff_20%,#7648ff_37%,#ffbb8c_52%,#18d6e7_72%,#0088ff_88%,#07c8ff)] p-[4px] shadow-[0_0_60px_rgba(0,150,255,.6),0_0_100px_rgba(83,74,255,.2)]">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#020914]">
          <div className="absolute inset-0 animate-[spin_18s_linear_infinite] bg-[conic-gradient(from_20deg,transparent,#0a75ff55,transparent,#ac63ff55,transparent,#ffbb8c44,transparent,#00dcff55,transparent)]" />
          <div className="absolute inset-[7%] animate-[spin_11s_linear_infinite_reverse] rounded-full opacity-90 [background:repeating-conic-gradient(from_0deg,transparent_0deg_9deg,rgba(38,189,255,.75)_10deg_11deg,transparent_12deg_23deg)] [mask-image:radial-gradient(circle,transparent_12%,black_48%,transparent_72%)]" />
          <div className={`absolute inset-[19%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#0b62bd_0%,#062253_25%,#050a1d_52%,#010308_100%)] shadow-[inset_0_0_55px_rgba(0,184,255,.55),0_0_36px_rgba(0,174,255,.18)] ${active ? "animate-pulse" : ""}`} />
          <div className="absolute inset-[23%] animate-[spin_8s_linear_infinite] rounded-full [background:conic-gradient(from_0deg,transparent_0_12%,rgba(48,211,255,.5)_18%,transparent_24%_42%,rgba(139,92,246,.55)_48%,transparent_56%_70%,rgba(255,183,118,.45)_77%,transparent_84%)] [mask-image:radial-gradient(circle,transparent_0_42%,black_48%_58%,transparent_64%)]" />
          <div className="absolute left-[21%] top-[43%] h-[16%] w-[60%] animate-[spin_7s_linear_infinite_reverse] rounded-[50%] border-2 border-cyan-200/65 shadow-[0_0_18px_rgba(60,217,255,.7)]" />
          <div className="absolute left-[28%] top-[25%] h-[50%] w-[44%] animate-[spin_12s_linear_infinite] rounded-[50%] border-2 border-violet-300/55 shadow-[0_0_16px_rgba(165,90,255,.5)]" />
          <div className="absolute left-1/2 top-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-cyan-200/20 shadow-[0_0_34px_rgba(103,232,249,.55)]" />
          {Array.from({ length: 36 }, (_, index) => <i key={index} className="absolute size-[2px] animate-pulse rounded-full bg-cyan-100 shadow-[0_0_6px_#4de8ff]" style={{ left: `${12 + ((index * 37) % 76)}%`, top: `${10 + ((index * 53) % 80)}%`, animationDelay: `${(index % 8) * 120}ms`, opacity: .35 + (index % 5) * .13 }} />)}
        </div>
      </div>
    </div>
  );
}

function StatusPoint({ className, icon: Icon, title, text, color }: { className: string; icon: LucideIcon; title: string; text: ReactNode; color: string }) {
  return <div className={`absolute ${className} w-[160px]`}><Icon className="mb-2 size-8" style={{ color, filter: `drop-shadow(0 0 10px ${color})` }} /><strong className="block text-sm text-[#e1efff]">{title}</strong><p className="mt-2 text-xs leading-5 text-[#9fc4e2]">{text}</p></div>;
}

function RoundControl({ icon: Icon, label, onClick, compact = false }: { icon: LucideIcon; label: string; onClick: () => void; compact?: boolean }) {
  return <button type="button" onClick={onClick} className="group mx-auto flex flex-col items-center gap-2 text-xs text-white"><span className={`flex ${compact ? "size-14" : "size-[64px]"} items-center justify-center rounded-full border border-[#0d65ac] bg-[#03101b] transition group-hover:border-[#2aaeff] group-hover:shadow-[0_0_20px_rgba(0,151,255,.18)]`}><Icon className={compact ? "size-5" : "size-6"} /></span>{label}</button>;
}

function StatusRow({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-xl border border-white/[.05] bg-white/[.02] px-3 py-2.5 text-left transition hover:border-cyan-300/15 hover:bg-white/[.04]"><span>{label}</span><span className="text-cyan-200/55">Abrir →</span></button>;
}

function MobileNav({ icon: Icon, label, onClick, primary = false }: { icon: LucideIcon; label: string; onClick: () => void; primary?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[8px] ${primary ? "bg-cyan-300/[.08] text-cyan-100" : "text-white/35"}`}><Icon className={primary ? "size-5" : "size-4"} /><span>{label}</span></button>;
}
