"use client";

import { useState, type FormEvent, type LucideIcon } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  Check,
  FileText,
  Gauge,
  Home,
  Keyboard,
  ListChecks,
  Mail,
  Megaphone,
  MessageSquareText,
  Mic,
  MonitorCog,
  Search,
  Settings,
  Sparkles,
  Square,
  Sun,
  UserRoundSearch,
  UsersRound,
  WandSparkles,
  Zap,
} from "lucide-react";

import { ChatPanel } from "../chat-panel";
import { SamuelVoiceReliabilityBridge } from "../samuel-voice-reliability-bridge";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";

const EMPTY_CHAT_MESSAGES: [] = [];

type SamuelAiFocusProps = {
  data: ExecutiveWorkspaceData;
  handlers: ExecutiveWorkspaceHandlers;
  onNavigate: (section: WorkspaceSection) => void;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  section?: WorkspaceSection;
  href?: string;
};

type PromptAction = {
  label: string;
  icon: LucideIcon;
  prompt: string;
};

const LEFT_NAV: NavItem[] = [
  { label: "Início", icon: Home, section: "samuel-ai" },
  { label: "Conversar", icon: MessageSquareText, section: "samuel-ai" },
  { label: "Tarefas", icon: ListChecks, section: "executive-tasks" },
  { label: "Agenda", icon: CalendarDays, section: "executive-agenda" },
  { label: "E-mails", icon: Mail, section: "executive-inbox" },
  { label: "Clientes (CRM)", icon: UsersRound, section: "crm" },
  { label: "Anúncios", icon: Megaphone, section: "marketing" },
  { label: "Sites & Apps", icon: MonitorCog, section: "site-builder" },
  { label: "Pesquisas", icon: Search, section: "executive-watchers" },
  { label: "Relatórios", icon: BarChart3, section: "dashboard" },
  { label: "Studio IA", icon: WandSparkles, section: "studio" },
  { label: "Configurações", icon: Settings, href: "/integrations" },
];

const RIGHT_ACTIONS: PromptAction[] = [
  { label: "Encontrar\nclientes", icon: UserRoundSearch, prompt: "Encontre novos clientes com maior potencial para a minha empresa e organize por prioridade." },
  { label: "Analisar\nempresas", icon: BarChart3, prompt: "Analise uma empresa e identifique oportunidades, riscos, posicionamento e possíveis abordagens comerciais." },
  { label: "Criar sites\ne apps", icon: FileText, prompt: "Quero criar um site ou aplicativo. Estruture a melhor solução e comece pelo escopo essencial." },
  { label: "Gerenciar\nanúncios", icon: Megaphone, prompt: "Analise e gerencie minhas campanhas de anúncios com foco em resultado e desperdício mínimo." },
  { label: "Enviar\ne-mails", icon: Mail, prompt: "Ajude-me a preparar e enviar os e-mails prioritários da empresa." },
  { label: "Agendar\ntarefas", icon: CalendarDays, prompt: "Organize minhas tarefas prioritárias e agende o que for necessário." },
];

const QUICK_ACTIONS: PromptAction[] = [
  { label: "Encontrar\nclientes", icon: UserRoundSearch, prompt: "Encontre clientes em potencial para a minha empresa agora." },
  { label: "Analisar\numa empresa", icon: BarChart3, prompt: "Quero analisar uma empresa. Peça apenas o dado indispensável e faça a análise." },
  { label: "Criar um site", icon: MonitorCog, prompt: "Quero criar um site. Estruture a solução e comece pelo que já pode ser executado." },
  { label: "Gerar uma\nproposta", icon: FileText, prompt: "Crie uma proposta comercial profissional com base no contexto da empresa e do cliente." },
  { label: "Agendar\ntarefa", icon: CalendarDays, prompt: "Quero agendar uma tarefa. Identifique o que falta e prepare o agendamento." },
];

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function SamuelAiFocus({ data, handlers, onNavigate }: SamuelAiFocusProps) {
  const companyId = data.executiveContext?.company.id ?? "default-company";
  const companyName = data.executiveContext?.company.name ?? data.briefing.companyName ?? "SF Growth AI";
  const [typingOpen, setTypingOpen] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");

  const sendThroughSamuel = (message: string) => {
    const cockpit = document.querySelector<HTMLElement>(".samuel-focus-cockpit");
    const textarea = cockpit?.querySelector<HTMLTextAreaElement>(".samuel-chat-textarea");
    if (!cockpit || !textarea || !message.trim()) return;
    setNativeTextareaValue(textarea, message.trim());
    window.setTimeout(() => {
      const sendButton = cockpit.querySelector<HTMLButtonElement>(".samuel-chat-send:not(.is-cancel)");
      if (sendButton && !sendButton.disabled) sendButton.click();
    }, 0);
  };

  const submitTypedMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!typedMessage.trim()) return;
    sendThroughSamuel(typedMessage);
    setTypedMessage("");
    setTypingOpen(false);
  };

  const stopSamuel = () => {
    const mic = document.querySelector<HTMLButtonElement>(".samuel-reference-mic");
    if (mic?.dataset.voiceCaptureState === "recording") mic.click();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  return (
    <section className="samuel-focus-cockpit relative h-dvh w-full overflow-hidden bg-[#02070c] text-[#dcecff]">
      <span hidden data-samuel-company-id={companyId} />
      <SamuelVoiceReliabilityBridge />

      <div className="absolute left-[-10000px] top-0 h-px w-px overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
        <ChatPanel
          key={companyId}
          initialMessages={EMPTY_CHAT_MESSAGES}
          companyId={companyId}
          isProcessing={handlers.isProcessing}
          onSendMessage={handlers.onSendMessage}
          onFirstMessage={handlers.onFirstMessage}
        />
      </div>

      <div className="relative mx-auto h-full max-h-[1024px] w-full max-w-[1536px] overflow-hidden bg-[#02070c] shadow-[0_0_80px_rgba(0,0,0,.75)]">
        <div className="grid h-full grid-cols-[18.65%_57.35%_24%]">
          <aside className="relative z-30 border-r border-cyan-300/10 bg-[linear-gradient(180deg,#03101a_0%,#020b12_55%,#02080e_100%)] px-[6.5%] py-[2.7%]">
            <div className="mb-[12%] flex items-center gap-3">
              <div className="relative flex size-[52px] items-center justify-center rounded-2xl bg-[conic-gradient(from_220deg,#16e0ff,#2866ff,#7a5cff,#00d9ff)] p-[2px] shadow-[0_0_30px_rgba(0,174,255,.35)]">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#06111c] text-[34px] font-black italic text-white">S</div>
              </div>
              <div>
                <div className="text-[clamp(16px,1.45vw,25px)] font-medium tracking-[.12em] text-[#cde8ff]">SAMUEL IA</div>
                <div className="mt-1 text-[clamp(8px,.65vw,11px)] font-semibold tracking-[.22em] text-[#b8d9f6]">SF GROWTH AI</div>
              </div>
            </div>

            <nav className="space-y-[0.5%]">
              {LEFT_NAV.map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon className="size-[20px] shrink-0" strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </>
                );
                const className = `flex min-h-[50px] w-full items-center gap-5 rounded-xl px-5 text-left text-[clamp(12px,1.05vw,17px)] transition ${index === 0 ? "border border-[#087cf5] bg-[linear-gradient(90deg,rgba(10,76,155,.65),rgba(9,35,69,.72))] font-semibold text-white shadow-[0_0_22px_rgba(0,119,255,.25)]" : "border border-transparent text-[#b8d9f6] hover:border-cyan-300/15 hover:bg-cyan-300/[.035] hover:text-white"}`;

                if (item.href) {
                  return <Link key={item.label} href={item.href} className={className}>{content}</Link>;
                }
                return (
                  <button key={item.label} type="button" className={className} onClick={() => item.section && onNavigate(item.section)}>
                    {content}
                  </button>
                );
              })}
            </nav>

            <div className="absolute bottom-[15.5%] left-[7%] right-[6%] rounded-2xl border border-[#0b6db5]/70 bg-[#03101b]/90 p-4 shadow-[inset_0_0_25px_rgba(0,95,160,.08)]">
              <div className="flex items-start gap-3">
                <span className="mt-1 size-3 shrink-0 rounded-full bg-[#2dff83] shadow-[0_0_14px_rgba(45,255,131,.9)]" />
                <div className="min-w-0">
                  <strong className="block text-[clamp(12px,.9vw,15px)] text-white">Samuel Online</strong>
                  <p className="mt-1 text-[clamp(9px,.72vw,12px)] leading-5 text-[#d2e6f8]">Voz em tempo real ativa</p>
                  <p className="text-[clamp(9px,.72vw,12px)] leading-5 text-[#d2e6f8]">OpenAI conectado</p>
                  <p className="text-[clamp(9px,.72vw,12px)] leading-5 text-[#d2e6f8]">Resposta em segundos</p>
                </div>
                <Activity className="ml-auto mt-4 size-6 text-[#00a9ff]" />
              </div>
            </div>

            <blockquote className="absolute bottom-[4.7%] left-[12%] right-[7%] text-[clamp(11px,.9vw,16px)] italic leading-[1.6] text-[#b8d9f6]">
              “Disciplina hoje,<br />resultados amanhã.”<br />— Samuel IA
            </blockquote>
          </aside>

          <main className="relative overflow-hidden bg-[#03101c]">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(0,116,255,.22),transparent_26%),radial-gradient(circle_at_50%_45%,rgba(0,216,255,.08),transparent_44%),linear-gradient(180deg,rgba(3,13,23,.78),rgba(1,9,16,.96))]" />
            <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:linear-gradient(90deg,transparent_0%,rgba(68,165,255,.05)_1px,transparent_1px),linear-gradient(180deg,transparent_0%,rgba(68,165,255,.035)_1px,transparent_1px)] [background-size:90px_90px]" />
            <div aria-hidden="true" className="absolute left-[4%] top-0 h-full w-[10%] -skew-x-6 bg-gradient-to-r from-white/[.02] via-cyan-200/[.06] to-transparent blur-xl" />
            <div aria-hidden="true" className="absolute right-[7%] top-0 h-full w-[8%] skew-x-6 bg-gradient-to-l from-white/[.02] via-blue-300/[.05] to-transparent blur-xl" />

            <header className="relative z-20 pt-[1.8%] text-center">
              <p className="text-[clamp(8px,.72vw,12px)] tracking-[.45em] text-[#a9c8e8]">MAIS IDEIAS. MAIS AÇÕES. MAIS RESULTADOS.</p>
              <h1 className="mt-[1.2%] text-[clamp(38px,4vw,64px)] font-semibold tracking-[.08em] text-[#dcecff] [text-shadow:0_0_24px_rgba(117,181,255,.16)]">SAMUEL IA</h1>
              <p className="mt-[.4%] text-[clamp(11px,1vw,18px)] tracking-[.5em] text-[#b5d3ef]">—SEU ASSISTENTE INTELIGENTE—</p>
            </header>

            <div className="relative z-20 mx-auto mt-[3%] h-[43%] w-[78%]">
              <StatusPoint className="left-0 top-[7%]" icon={Activity} title="OUVINDO" text={<>Captando<br />e entendendo...</>} color="#30d8ff" />
              <StatusPoint className="right-0 top-[8%]" icon={BrainCircuit} title="PENSANDO" text={<>Analisando e<br />conectando ideias...</>} color="#b66cff" align="right" />
              <StatusPoint className="bottom-[2%] left-[1%]" icon={Settings} title="EXECUTANDO" text={<>Colocando em<br />prática...</>} color="#64ffd4" />
              <StatusPoint className="bottom-[2%] right-[1%]" icon={MessageSquareText} title="FALANDO" text={<>Respondendo<br />para você...</>} color="#ffc398" align="right" />

              <div className="absolute left-1/2 top-1/2 size-[min(39vw,440px)] -translate-x-1/2 -translate-y-1/2">
                <div className="absolute inset-0 animate-spin rounded-full border border-cyan-200/20 [animation-duration:26s] [background:repeating-conic-gradient(from_0deg,rgba(0,174,255,.55)_0deg_1deg,transparent_1deg_11deg)] [mask-image:radial-gradient(circle,transparent_61%,black_62%)]" />
                <div className="absolute inset-[4%] animate-[spin_18s_linear_infinite_reverse] rounded-full border border-blue-300/25 [background:repeating-conic-gradient(from_40deg,rgba(57,153,255,.45)_0deg_2deg,transparent_2deg_17deg)] [mask-image:radial-gradient(circle,transparent_70%,black_71%)]" />
                <div className="absolute inset-[9%] rounded-full bg-[conic-gradient(from_210deg,#07c8ff,#0a65ff_20%,#7648ff_35%,#ffbb8c_50%,#18d6e7_70%,#0088ff_86%,#07c8ff)] p-[4px] shadow-[0_0_60px_rgba(0,150,255,.65),0_0_100px_rgba(83,74,255,.22)]">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#020914]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_33%_28%,rgba(54,213,255,.55),transparent_23%),radial-gradient(circle_at_72%_36%,rgba(136,79,255,.4),transparent_26%),radial-gradient(circle_at_60%_70%,rgba(255,178,116,.42),transparent_24%),radial-gradient(circle_at_28%_72%,rgba(0,224,255,.34),transparent_29%)]" />
                    <div className="absolute inset-[5%] animate-[spin_9s_linear_infinite] rounded-full opacity-85 [background:repeating-conic-gradient(from_0deg,transparent_0deg_8deg,rgba(38,189,255,.7)_10deg_11deg,transparent_12deg_24deg)] [mask-image:radial-gradient(circle,transparent_0%,black_38%,transparent_68%)]" />
                    <div className="absolute inset-[10%] animate-[spin_14s_linear_infinite_reverse] rounded-full opacity-80 [background:repeating-conic-gradient(from_30deg,rgba(130,75,255,.9)_0deg_1deg,transparent_2deg_13deg,rgba(255,187,120,.8)_14deg_15deg,transparent_16deg_26deg)] [mask-image:radial-gradient(circle,transparent_17%,black_48%,transparent_72%)]" />
                    <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_36%_30%,#022c72_0%,#06133d_28%,#020714_58%,#00040a_100%)] shadow-[inset_0_0_42px_rgba(0,184,255,.45)]" />
                    <div className="absolute left-[19%] top-[25%] h-[45%] w-[68%] rotate-[22deg] rounded-[50%] border-[3px] border-cyan-200/65 shadow-[0_0_18px_rgba(60,217,255,.75)] [clip-path:polygon(0_0,100%_12%,100%_72%,0_100%)]" />
                    <div className="absolute left-[17%] top-[39%] h-[25%] w-[73%] -rotate-[18deg] rounded-[50%] border-[3px] border-blue-300/65 shadow-[0_0_16px_rgba(60,126,255,.75)]" />
                    <div className="absolute left-[25%] top-[17%] h-[66%] w-[48%] rotate-[58deg] rounded-[50%] border-2 border-violet-300/55 shadow-[0_0_16px_rgba(165,90,255,.55)]" />
                    {Array.from({ length: 42 }, (_, index) => (
                      <i key={index} className="absolute size-[2px] rounded-full bg-cyan-100 shadow-[0_0_6px_#4de8ff]" style={{ left: `${12 + ((index * 37) % 76)}%`, top: `${10 + ((index * 53) % 80)}%`, opacity: .35 + (index % 5) * .13 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-30 mx-auto mt-[-1%] w-[47%] rounded-[36px] border border-[#0878e9] bg-[#031326]/95 px-5 py-4 text-center shadow-[0_0_26px_rgba(0,101,255,.14)]">
              <div className="flex items-center justify-center gap-5">
                <Activity className="size-8 text-[#17a8ff]" />
                <div>
                  <strong className="block text-[clamp(12px,1.05vw,18px)] text-white">Estou ouvindo...</strong>
                  <span className="text-[clamp(10px,.82vw,14px)] text-[#b9d6f0]">Fale naturalmente em português</span>
                </div>
              </div>
            </div>

            <div className="relative z-30 mx-auto mt-[1.3%] grid w-[52%] grid-cols-[1fr_1.4fr_1fr] items-center gap-5 text-center">
              <button type="button" onClick={() => setTypingOpen(true)} className="group mx-auto flex flex-col items-center gap-2 text-[clamp(10px,.85vw,14px)] text-white">
                <span className="flex size-[70px] items-center justify-center rounded-full border border-[#0d65ac] bg-[#03101b] transition group-hover:border-[#2aaeff] group-hover:shadow-[0_0_20px_rgba(0,151,255,.18)]"><Keyboard className="size-7 text-[#cce8ff]" /></span>
                Digitar
              </button>

              <button type="button" aria-label="Toque para falar" className="samuel-reference-mic samuel-voice-console__start group mx-auto flex flex-col items-center gap-2 text-[clamp(10px,.85vw,14px)] font-semibold text-white">
                <span className="relative flex size-[118px] items-center justify-center rounded-full border border-[#0b71e6] bg-[radial-gradient(circle,#083671_0%,#051a38_55%,#020b16_100%)] shadow-[0_0_0_10px_rgba(0,116,255,.10),0_0_0_18px_rgba(0,174,255,.05),0_0_38px_rgba(0,152,255,.55)] transition group-hover:scale-[1.03]">
                  <span className="absolute inset-[-14px] animate-pulse rounded-full border border-cyan-300/15" />
                  <Mic className="size-11 text-white drop-shadow-[0_0_12px_#00a9ff]" />
                </span>
                <span className="mt-1">Toque para falar</span>
              </button>

              <button type="button" onClick={stopSamuel} className="group mx-auto flex flex-col items-center gap-2 text-[clamp(10px,.85vw,14px)] text-white">
                <span className="flex size-[70px] items-center justify-center rounded-full border border-[#0d65ac] bg-[#03101b] transition group-hover:border-[#2aaeff] group-hover:shadow-[0_0_20px_rgba(0,151,255,.18)]"><Square className="size-6 fill-[#cae5ff] text-[#cae5ff]" /></span>
                Encerrar
              </button>
            </div>

            <div className="absolute bottom-[9.2%] left-[3.6%] right-[3.6%] z-30 grid grid-cols-5 gap-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.label} type="button" onClick={() => sendThroughSamuel(action.prompt)} className="flex min-h-[66px] items-center gap-3 rounded-xl border border-[#0b5d9d] bg-[#03101b]/90 px-4 text-left text-[clamp(8px,.72vw,12px)] text-white transition hover:border-[#119dff] hover:bg-[#061a2c]">
                    <Icon className="size-7 shrink-0 text-[#179dff] drop-shadow-[0_0_8px_#0077ff]" />
                    <span className="whitespace-pre-line leading-5">{action.label}</span>
                  </button>
                );
              })}
            </div>

            <footer className="absolute bottom-0 left-0 right-0 z-30 flex h-[7.2%] items-center justify-between border-t border-[#0b456d]/60 bg-[#020a12]/95 px-[4%] text-[clamp(6px,.52vw,9px)] tracking-[.28em] text-[#a9c8e8]">
              <span><strong className="text-white">SF GROWTH AI</strong> &nbsp;|&nbsp; AUTOMAÇÃO · RESULTADOS · LIBERDADE</span>
              <span>TRANSFORMANDO IDEIAS EM REALIDADE &nbsp;<b className="inline-block h-px w-8 bg-[#00a9ff] align-middle" /></span>
            </footer>
          </main>

          <aside className="relative z-30 border-l border-cyan-300/10 bg-[linear-gradient(180deg,#020a11_0%,#02080e_100%)] px-[7.5%] py-[2.4%]">
            <div className="mb-[6%] flex items-start justify-between gap-3">
              <div className="flex items-center gap-7 text-[#c9e6ff]">
                <Sun className="size-8" strokeWidth={1.4} />
                <div className="relative"><Bell className="size-7" strokeWidth={1.5} /><span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-[#ff2b37] text-[10px] font-bold text-white">1</span></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full border border-[#0f8bff] text-[17px] text-white">SF</div>
                <div className="h-10 w-px bg-[#0b4e7c]" />
                <div className="text-[clamp(9px,.72vw,12px)] leading-5 text-[#bfd9ef]">Sempre aprendendo.<br />Sempre ao seu lado.</div>
              </div>
            </div>

            <section className="rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4">
              <h2 className="text-[clamp(14px,1.1vw,19px)] font-semibold text-white">Como posso ajudar você hoje?</h2>
              <p className="mt-2 text-[clamp(9px,.73vw,12px)] leading-5 text-[#c6dcf0]">Conte com minha inteligência para transformar<br className="hidden 2xl:block" /> suas ideias em resultados reais.</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {RIGHT_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button key={action.label} type="button" onClick={() => sendThroughSamuel(action.prompt)} className="flex min-h-[108px] flex-col items-center justify-center gap-3 rounded-xl border border-[#0a426e] bg-[#051321] px-2 text-center text-[clamp(8px,.69vw,12px)] text-white transition hover:border-[#0c9cff] hover:bg-[#071a2b]">
                      <Icon className="size-8 text-[#1cb4ff] drop-shadow-[0_0_8px_#007dff]" />
                      <span className="whitespace-pre-line leading-5">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-[4%] rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-5">
              <h3 className="text-[clamp(12px,.9vw,15px)] font-semibold text-white">Status em tempo real</h3>
              <div className="mt-4 space-y-3 text-[clamp(9px,.77vw,13px)] text-[#c9dff3]">
                <StatusLine first label="Tudo funcionando!" />
                <StatusLine label="OpenAI conectado" />
                <StatusLine label="Voz natural ativa (pt-BR)" />
                <StatusLine label="Ferramentas integradas" />
                <StatusLine label="Memória e contexto habilitados" />
                <StatusLine label="Pronto para executar tarefas" />
              </div>
            </section>

            <section className="mt-[4%] rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 px-5 py-6">
              <p className="text-[clamp(10px,.85vw,15px)] leading-6 text-[#d4e6f6]">“Mais do que uma IA,<br />um parceiro para o seu crescimento.”</p>
              <div className="mt-5 text-right text-[clamp(20px,2vw,32px)] italic text-[#dcecff]">Samuel IA</div>
            </section>
          </aside>
        </div>
      </div>

      {typingOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={submitTypedMessage} className="w-full max-w-2xl rounded-3xl border border-[#0d78c5] bg-[#03101b] p-5 shadow-[0_0_60px_rgba(0,127,255,.25)]">
            <div className="mb-4 flex items-center justify-between"><strong className="text-lg text-white">Conversar com Samuel</strong><button type="button" onClick={() => setTypingOpen(false)} className="text-sm text-[#9cc6e8]">Fechar</button></div>
            <textarea autoFocus value={typedMessage} onChange={(event) => setTypedMessage(event.target.value)} rows={4} placeholder="Digite o que precisa..." className="w-full resize-none rounded-2xl border border-[#164f78] bg-[#06131f] p-4 text-white outline-none placeholder:text-[#64839b] focus:border-[#0d9dff]" />
            <div className="mt-4 flex justify-end"><button type="submit" className="rounded-xl border border-[#0d83e5] bg-[#062d55] px-5 py-3 text-sm font-semibold text-white">Enviar ao Samuel</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

function StatusPoint({ className, icon: Icon, title, text, color, align = "left" }: { className: string; icon: LucideIcon; title: string; text: React.ReactNode; color: string; align?: "left" | "right" }) {
  return (
    <div className={`absolute ${className} w-[22%] ${align === "right" ? "text-left" : "text-left"}`}>
      <Icon className="mb-3 size-9" style={{ color, filter: `drop-shadow(0 0 10px ${color})` }} strokeWidth={1.7} />
      <strong className="block text-[clamp(11px,1vw,17px)] text-[#e1efff]">{title}</strong>
      <p className="mt-3 text-[clamp(9px,.8vw,14px)] leading-5 text-[#b8d6f2]">{text}</p>
    </div>
  );
}

function StatusLine({ label, first = false }: { label: string; first?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {first ? <span className="size-3 rounded-full bg-[#30ff88] shadow-[0_0_12px_rgba(48,255,136,.9)]" /> : <Check className="size-5 text-[#31ff80] drop-shadow-[0_0_6px_rgba(49,255,128,.65)]" strokeWidth={2.2} />}
      <span>{label}</span>
    </div>
  );
}
