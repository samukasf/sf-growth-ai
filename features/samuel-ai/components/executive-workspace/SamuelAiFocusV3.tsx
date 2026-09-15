"use client";

import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  FileText,
  Home,
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
  X,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";

import type { SamuelToolActionPlan } from "../../chat/samuel-chat.types";
import type { ChatMessage } from "../../types";
import { useSamuelSpeech } from "../../voice/use-samuel-speech";
import type { ExecutiveWorkspaceData, ExecutiveWorkspaceHandlers } from "./executive-workspace.types";
import type { WorkspaceSection } from "./workspace-navigation";
import {
  isSamuelConfirmationPhrase,
  useSamuelVoiceV3,
} from "./use-samuel-voice-v3";

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

type GoogleStatus = {
  connected?: boolean;
  tokenHealthy?: boolean;
  reconnectRequired?: boolean;
  email?: string | null;
  healthMessage?: string | null;
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
    prompt: "Crie uma proposta comercial profissional usando o contexto da empresa. Pergunte somente o que for indispensável.",
  },
  { label: "Agendar tarefa", icon: CalendarDays, section: "executive-agenda" },
];

function createMessage(role: ChatMessage["role"], content: string, status: ChatMessage["status"] = "complete"): ChatMessage {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    content,
    timestamp: new Date().toISOString(),
    status,
  };
}

export function SamuelAiFocusV3({ data, handlers, onNavigate }: Props) {
  const companyId = data.executiveContext?.company.id ?? "default-company";
  const [conversationOpen, setConversationOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [pendingAction, setPendingAction] = useState<SamuelToolActionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const firstMessageRef = useRef(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const speech = useSamuelSpeech({ enabled: true, companyId });
  const lastAssistantText = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant" && message.content.trim())?.content ?? "",
    [messages],
  );

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pendingAction]);

  const refreshGoogleStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/integrations/google/status?companyId=${encodeURIComponent(companyId)}`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as GoogleStatus | null;
      if (payload) setGoogleStatus(payload);
    } catch {
      setGoogleStatus(null);
    }
  }, [companyId]);

  useEffect(() => {
    void refreshGoogleStatus();
  }, [refreshGoogleStatus]);

  const executePendingAction = useCallback(async () => {
    const action = pendingAction;
    if (!action?.confirmationToken || sending) return;
    setSending(true);
    setError(null);
    try {
      const endpoint = action.surface === "calendar"
        ? "/api/samuel-ai/calendar/actions"
        : "/api/samuel-ai/gmail/actions";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          actionId: action.actionId,
          args: action.args,
          confirmationToken: action.confirmationToken,
          confirm: true,
        }),
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        summary?: string;
        error?: string;
      };
      const content = response.ok
        ? payload.summary || "Ação executada com sucesso."
        : payload.error || payload.summary || "Não consegui executar esta ação.";
      const assistant = createMessage("assistant", content, response.ok ? "complete" : "error");
      setMessages((current) => [...current, assistant]);
      setPendingAction(null);
      if (!response.ok) setError(content);
      speech.speak(content);
      if (/google|agenda|gmail|oauth|token|autoriza/i.test(content)) void refreshGoogleStatus();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Falha ao executar a ação.";
      setMessages((current) => [...current, createMessage("assistant", message, "error")]);
      setError(message);
      speech.speak(message);
    } finally {
      setSending(false);
    }
  }, [companyId, pendingAction, refreshGoogleStatus, sending, speech]);

  const sendMessage = useCallback(async (raw: string, source: "voice" | "text" | "shortcut" = "text") => {
    const content = raw.trim();
    if (!content || sending || handlers.isProcessing) return;

    if (source === "voice" && pendingAction && isSamuelConfirmationPhrase(content)) {
      await executePendingAction();
      return;
    }

    if (!firstMessageRef.current) {
      firstMessageRef.current = true;
      handlers.onFirstMessage();
    }

    if (speech.speaking) speech.cancel();
    setConversationOpen(true);
    setInput("");
    setError(null);
    setPendingAction(null);
    setSending(true);

    const userMessage = createMessage("user", content);
    const assistantId = `assistant-${crypto.randomUUID()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      status: "streaming",
    };
    const history = messages.filter((message) => message.status === "complete");
    setMessages((current) => [...current, userMessage, assistantPlaceholder]);

    const controller = new AbortController();
    abortRef.current = controller;
    let finalContent = "";
    try {
      const result = await handlers.onSendMessage(content, {
        conversationId,
        history,
        signal: controller.signal,
        onEvent(event) {
          if (event.type === "start") setConversationId(event.conversationId);
          if (event.type === "provider") {
            setProvider(event.model ? `${event.provider} · ${event.model}` : event.provider);
          }
          if (event.type === "action_proposal") setPendingAction(event.action);
          if (event.type === "delta") {
            setMessages((current) => current.map((message) =>
              message.id === assistantId
                ? { ...message, content: `${message.content}${event.delta}` }
                : message,
            ));
          }
          if (event.type === "complete") {
            finalContent = event.message.content;
            setConversationId(event.conversationId);
            setMessages((current) => current.map((message) =>
              message.id === assistantId ? event.message : message,
            ));
            if (event.pendingAction) setPendingAction(event.pendingAction);
          }
          if (event.type === "warning") setError(event.message);
        },
      });

      finalContent = finalContent || result.content;
      setConversationId(result.conversationId);
      setProvider(result.model ? `${result.provider} · ${result.model}` : result.provider);
      setMessages((current) => current.map((message) =>
        message.id === assistantId
          ? { ...message, content: finalContent, status: "complete" }
          : message,
      ));
      if (finalContent) speech.speak(finalContent);
    } catch (caught) {
      const cancelled = controller.signal.aborted;
      const message = cancelled
        ? "Resposta interrompida."
        : caught instanceof Error
          ? caught.message
          : "Não consegui concluir a resposta.";
      setMessages((current) => current.map((item) =>
        item.id === assistantId
          ? { ...item, content: item.content || message, status: cancelled ? "cancelled" : "error" }
          : item,
      ));
      if (!cancelled) {
        setError(message);
        speech.speak(message);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setSending(false);
    }
  }, [conversationId, executePendingAction, handlers, messages, pendingAction, sending, speech]);

  const interrupt = useCallback(() => {
    speech.cancel();
    abortRef.current?.abort();
  }, [speech]);

  const voice = useSamuelVoiceV3({
    companyId,
    assistantSpeaking: speech.speaking,
    assistantText: lastAssistantText,
    onInterrupt: interrupt,
    onTranscript: async ({ text }) => {
      setConversationOpen(true);
      await sendMessage(text, "voice");
    },
  });

  const stopAll = useCallback(() => {
    voice.stop();
    interrupt();
  }, [interrupt, voice]);

  const systemState = speech.speaking
    ? "speaking"
    : voice.phase === "processing" || sending || handlers.isProcessing
      ? "thinking"
      : voice.active
        ? "listening"
        : "idle";

  const runAction = (action: Action) => {
    if (action.section) onNavigate(action.section);
    else if (action.prompt) void sendMessage(action.prompt, "shortcut");
  };

  const googleHealthy = Boolean(googleStatus?.connected && googleStatus?.tokenHealthy && !googleStatus?.reconnectRequired);
  const alertCount =
    (data.watcherExecutive?.summary.criticalAlerts ?? 0) +
    (data.executiveMonitoring?.alerts.length ?? 0);

  return (
    <section className="samuel-focus-cockpit relative h-dvh w-full overflow-hidden bg-[#02070c] text-[#dcecff]">
      <span hidden data-samuel-company-id={companyId} />

      <ConversationLayer
        open={conversationOpen}
        onClose={() => setConversationOpen(false)}
        messages={messages}
        input={input}
        onInput={setInput}
        onSubmit={(value) => void sendMessage(value, "text")}
        onStop={interrupt}
        sending={sending || handlers.isProcessing}
        pendingAction={pendingAction}
        onConfirm={() => void executePendingAction()}
        onCancelAction={() => setPendingAction(null)}
        error={error}
        provider={provider}
        voiceActive={voice.active}
        voicePhase={voice.phase}
        onToggleVoice={() => void voice.toggle()}
        onStopVoice={voice.stop}
        messageEndRef={messageEndRef}
        googleHealthy={googleHealthy}
        googleStatus={googleStatus}
        companyId={companyId}
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
            <StatusPoint className="left-[8%] top-[14%]" icon={Activity} title="OUVINDO" text={<>Captando<br />e entendendo...</>} color="#35d9ff" active={systemState === "listening"} />
            <StatusPoint className="right-[6%] top-[14%]" icon={BrainCircuit} title="PENSANDO" text={<>Analisando e<br />conectando ideias...</>} color="#bd73ff" active={systemState === "thinking"} />
            <StatusPoint className="bottom-[15%] left-[8%]" icon={Settings} title="EXECUTANDO" text={<>Colocando em<br />prática...</>} color="#66ffd5" active={Boolean(pendingAction) || handlers.isProcessing} />
            <StatusPoint className="bottom-[15%] right-[6%]" icon={MessageSquareText} title="FALANDO" text={<>Respondendo<br />para você...</>} color="#ffc89d" active={systemState === "speaking"} />

            <div className="absolute left-1/2 top-1/2 size-[min(46vh,470px)] -translate-x-1/2 -translate-y-1/2">
              <SamuelCore state={systemState} />
            </div>
          </div>

          <div className="shrink-0 px-5 pb-3">
            <div className="mx-auto max-w-[620px] rounded-[30px] border border-[#0878e9] bg-[#031326]/95 px-5 py-3 text-center shadow-[0_0_26px_rgba(0,101,255,.14)]">
              <div className="flex items-center justify-center gap-4">
                <Activity className={`size-7 text-[#17a8ff] ${systemState !== "idle" ? "animate-pulse" : ""}`} />
                <div>
                  <strong className="block text-sm text-white">
                    {systemState === "speaking" ? "Estou respondendo..." : systemState === "thinking" ? "Estou pensando..." : voice.active ? "Estou ouvindo..." : "Pronto para ouvir"}
                  </strong>
                  <span className="text-xs text-[#b9d6f0]">
                    {voice.error || (voice.active ? "Fale naturalmente — você pode me interromper." : "Toque no microfone ou escreva.")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-3 grid max-w-[620px] grid-cols-[1fr_1.35fr_1fr] items-start gap-7 text-center">
              <RoundControl icon={Keyboard} label="Digitar" onClick={() => setConversationOpen(true)} />
              <button type="button" aria-label={voice.active ? "Encerrar conversa por voz" : "Iniciar conversa por voz"} onClick={() => void voice.toggle()} className="samuel-reference-mic group mx-auto flex flex-col items-center gap-2 text-xs font-semibold text-white">
                <span className="relative flex size-[96px] items-center justify-center rounded-full border border-[#0b71e6] bg-[radial-gradient(circle,#083671_0%,#051a38_55%,#020b16_100%)] shadow-[0_0_0_8px_rgba(0,116,255,.10),0_0_30px_rgba(0,152,255,.52)] transition group-hover:scale-[1.03]">
                  <span className={`absolute inset-[-11px] rounded-full border border-cyan-300/15 ${voice.active ? "animate-ping" : "animate-pulse"}`} />
                  <Mic className="size-10 text-white drop-shadow-[0_0_12px_#00a9ff]" />
                </span>
                <span>{voice.active ? "Ouvindo — toque para encerrar" : "Toque para falar"}</span>
              </button>
              <RoundControl icon={Square} label="Encerrar" onClick={stopAll} />
            </div>

            <div className="mx-auto mt-4 grid max-w-[940px] grid-cols-5 gap-2">
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

        <RightPanel
          actions={RIGHT_ACTIONS}
          onAction={runAction}
          alertCount={alertCount}
          onAlerts={() => onNavigate("executive-alerts")}
          googleHealthy={googleHealthy}
          googleStatus={googleStatus}
          voiceActive={voice.active}
        />
      </div>

      <MobilePanel
        state={systemState}
        voiceActive={voice.active}
        voiceError={voice.error}
        onToggleVoice={() => void voice.toggle()}
        onOpenConversation={() => setConversationOpen(true)}
        onStop={stopAll}
        onNavigate={onNavigate}
        onAction={runAction}
      />
    </section>
  );
}

function ConversationLayer({
  open,
  onClose,
  messages,
  input,
  onInput,
  onSubmit,
  onStop,
  sending,
  pendingAction,
  onConfirm,
  onCancelAction,
  error,
  provider,
  voiceActive,
  voicePhase,
  onToggleVoice,
  onStopVoice,
  messageEndRef,
  googleHealthy,
  googleStatus,
  companyId,
}: {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  input: string;
  onInput: (value: string) => void;
  onSubmit: (value: string) => void;
  onStop: () => void;
  sending: boolean;
  pendingAction: SamuelToolActionPlan | null;
  onConfirm: () => void;
  onCancelAction: () => void;
  error: string | null;
  provider: string | null;
  voiceActive: boolean;
  voicePhase: string;
  onToggleVoice: () => void;
  onStopVoice: () => void;
  messageEndRef: React.RefObject<HTMLDivElement | null>;
  googleHealthy: boolean;
  googleStatus: GoogleStatus | null;
  companyId: string;
}) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(input);
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[180] flex items-center justify-center bg-[#01050a]/88 p-2 backdrop-blur-xl sm:p-5">
      <div className="flex h-[96dvh] w-[98vw] max-w-[1480px] flex-col overflow-hidden rounded-[26px] border border-[#117fd0] bg-[linear-gradient(180deg,#041322,#020912)] shadow-[0_0_90px_rgba(0,127,255,.30)] sm:h-[94dvh] sm:w-[96vw]">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#164f78] px-4 py-4 sm:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-3"><MessageSquareText className="size-6 text-cyan-300" /><strong className="text-xl text-white sm:text-2xl">Conversar com Samuel</strong></div>
            <p className="mt-1 text-sm text-[#9fc5e2]">Voz, texto e execução no mesmo histórico. A conversa fica visível enquanto Samuel trabalha.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={onToggleVoice} className={`rounded-xl border px-3 py-2.5 text-sm ${voiceActive ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100" : "border-[#17597f] text-cyan-100"}`}><Mic className="mr-2 inline size-4" />{voiceActive ? "Ouvindo" : "Falar"}</button>
            {voiceActive && <button type="button" onClick={onStopVoice} className="rounded-xl border border-[#17597f] px-3 py-2.5 text-sm text-white/70">Parar voz</button>}
            <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-xl border border-[#17597f] text-white/70 hover:border-cyan-300/50"><X className="size-5" /></button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
              {messages.length === 0 ? (
                <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/[.05]"><Mic className="size-7 text-cyan-300" /></div>
                  <h2 className="mt-5 text-2xl font-semibold text-white">Fale comigo naturalmente</h2>
                  <p className="mt-2 max-w-xl text-base leading-7 text-[#9fc5e2]">Você pode falar, interromper minha resposta e pedir ações reais. Exemplo: “coloque um compromisso amanhã às 15h na minha agenda”.</p>
                </div>
              ) : (
                <div className="mx-auto flex max-w-4xl flex-col gap-5">
                  {messages.map((message) => (
                    <article key={message.id} className={`max-w-[88%] rounded-2xl border px-5 py-4 text-[16px] leading-7 sm:text-[17px] ${message.role === "user" ? "ml-auto border-[#17639d] bg-[#07305a]/70 text-white" : "mr-auto border-white/[.09] bg-white/[.045] text-[#dfedfa]"}`}>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-white/35">{message.role === "user" ? "Você" : "Samuel"}</div>
                      <div className="whitespace-pre-wrap">{message.content || (message.status === "streaming" ? "Pensando…" : "")}</div>
                    </article>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            {pendingAction && (
              <div className="mx-4 mb-3 rounded-2xl border border-amber-300/30 bg-amber-300/[.07] p-4 sm:mx-8">
                <div className="text-xs font-semibold uppercase tracking-[.18em] text-amber-200">Confirmação necessária</div>
                <p className="mt-2 text-base leading-6 text-white">{pendingAction.preview || pendingAction.title}</p>
                <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={onConfirm} className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400">Confirmar e executar</button><button type="button" onClick={onCancelAction} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/70">Cancelar</button></div>
              </div>
            )}

            {error && <div className="mx-4 mb-3 rounded-xl border border-red-400/25 bg-red-400/[.06] px-4 py-3 text-sm text-red-100 sm:mx-8">{error}</div>}

            <form onSubmit={submit} className="shrink-0 border-t border-[#164f78] bg-[#03101b]/96 p-4 sm:p-6">
              <div className="mx-auto flex max-w-5xl items-end gap-3 rounded-2xl border border-[#17649b] bg-[#020a12] p-2.5 focus-within:border-cyan-300/55">
                <textarea value={input} onChange={(event) => onInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSubmit(input); } }} rows={2} placeholder="Diga ou escreva o que precisa…" className="min-h-[62px] flex-1 resize-none bg-transparent px-3 py-2 text-[16px] leading-6 text-white outline-none placeholder:text-white/30 sm:text-[17px]" />
                {sending ? <button type="button" onClick={onStop} className="flex size-12 items-center justify-center rounded-xl bg-red-500/90 text-white"><Square className="size-5" /></button> : <button type="submit" disabled={!input.trim()} className="flex h-12 items-center justify-center rounded-xl bg-cyan-500 px-5 text-sm font-semibold text-white disabled:opacity-30">Enviar</button>}
              </div>
            </form>
          </section>

          <aside className="hidden min-h-0 overflow-y-auto border-l border-[#164f78] bg-[#020a12]/75 p-5 lg:block">
            <h3 className="text-sm font-semibold text-white">Estado da conversa</h3>
            <div className="mt-4 space-y-3 text-sm text-[#9fc5e2]">
              <InfoLine label="Microfone" value={voiceActive ? `Ativo · ${voicePhase}` : "Parado"} good={voiceActive} />
              <InfoLine label="Google" value={googleHealthy ? googleStatus?.email || "Ligado" : "Reconectar"} good={googleHealthy} />
              <InfoLine label="IA" value={provider || "Automático"} good />
              <InfoLine label="Empresa" value={companyId === "default-company" ? "Workspace" : "Ativa"} good={companyId !== "default-company"} />
            </div>
            {!googleHealthy && (
              <a href={`/api/integrations/google/oauth/authorize?companyId=${encodeURIComponent(companyId)}`} className="mt-5 block rounded-xl border border-cyan-300/25 bg-cyan-300/[.06] px-4 py-3 text-center text-sm font-semibold text-cyan-100">Reconectar Google Workspace</a>
            )}
            <div className="mt-6 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 text-sm leading-6 text-white/55">Enquanto Samuel fala, o microfone continua aberto. Comece a falar para interromper a resposta.</div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DesktopSidebar({ onNavigate, onOpenConversation }: { onNavigate: (section: WorkspaceSection) => void; onOpenConversation: () => void }) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-cyan-300/10 bg-[linear-gradient(180deg,#03101a,#02080e)] p-4">
      <div className="flex items-center gap-3 px-2 py-2"><div className="flex size-11 items-center justify-center rounded-2xl border border-[#0d8cff] bg-[#06111c] text-2xl font-black italic text-white shadow-[0_0_24px_rgba(0,174,255,.25)]">S</div><div><div className="text-lg tracking-[.12em] text-[#cde8ff]">SAMUEL IA</div><div className="mt-1 text-[9px] font-semibold tracking-[.2em] text-[#8fb9d7]">SF GROWTH AI</div></div></div>
      <nav className="mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {LEFT_NAV.map((item, index) => {
          const content = <><item.icon className="size-[18px] shrink-0" /><span>{item.label}</span></>;
          const classes = `flex min-h-11 w-full items-center gap-4 rounded-xl border px-4 text-left text-sm transition ${index === 0 ? "border-[#087cf5] bg-[linear-gradient(90deg,rgba(10,76,155,.65),rgba(9,35,69,.72))] font-semibold text-white" : "border-transparent text-[#b8d9f6] hover:border-cyan-300/15 hover:bg-cyan-300/[.04] hover:text-white"}`;
          if (item.href) return <Link key={item.label} href={item.href} className={classes}>{content}</Link>;
          return <button key={item.label} type="button" className={classes} onClick={() => item.conversation ? onOpenConversation() : item.section && onNavigate(item.section)}>{content}</button>;
        })}
      </nav>
      <div className="mt-3 rounded-2xl border border-[#0b6db5]/60 bg-[#03101b] p-4"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#2dff83] shadow-[0_0_10px_rgba(45,255,131,.8)]" /><strong className="text-xs text-white">Samuel Online</strong></div><p className="mt-2 text-[10px] leading-5 text-[#9fc3de]">Voz contínua, memória, contexto empresarial e execução supervisionada.</p></div>
    </aside>
  );
}

function RightPanel({ actions, onAction, alertCount, onAlerts, googleHealthy, googleStatus, voiceActive }: { actions: Action[]; onAction: (action: Action) => void; alertCount: number; onAlerts: () => void; googleHealthy: boolean; googleStatus: GoogleStatus | null; voiceActive: boolean }) {
  return (
    <aside className="min-h-0 overflow-y-auto bg-[linear-gradient(180deg,#020a11,#02080e)] p-4">
      <div className="flex items-center justify-end gap-4"><button type="button" onClick={onAlerts} className="relative text-[#c9e6ff]"><Bell className="size-6" />{alertCount > 0 && <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">{Math.min(alertCount, 9)}</span>}</button><Link href="/empresas" className="flex size-10 items-center justify-center rounded-full border border-[#0f8bff] text-sm text-white">SF</Link></div>
      <section className="mt-5 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4"><h2 className="text-lg font-semibold text-white">Como posso ajudar você hoje?</h2><p className="mt-2 text-xs leading-5 text-[#a9c6de]">Conte com minha inteligência para transformar suas ideias em resultados reais.</p><div className="mt-4 grid grid-cols-2 gap-2">{actions.map((action) => <button key={action.label} type="button" onClick={() => onAction(action)} className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border border-[#0a426e] bg-[#051321] p-3 text-center text-[11px] text-white transition hover:border-[#0c9cff] hover:bg-[#071a2b]"><action.icon className="size-7 text-[#1cb4ff]" /><span>{action.label}</span></button>)}</div></section>
      <section className="mt-4 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-4"><h3 className="text-sm font-semibold">Status em tempo real</h3><div className="mt-3 space-y-2 text-xs text-[#b6d0e5]"><StatusCheck label={voiceActive ? "Microfone ativo" : "Samuel pronto"} good /><StatusCheck label={googleHealthy ? `Google ligado${googleStatus?.email ? ` · ${googleStatus.email}` : ""}` : "Google precisa reconectar"} good={googleHealthy} /><StatusCheck label="Memória e contexto habilitados" good /><StatusCheck label="Ferramentas integradas" good={googleHealthy} /><StatusCheck label="Pronto para executar tarefas" good /></div>{!googleHealthy && <a href="/integrations" className="mt-3 block rounded-xl border border-amber-300/20 bg-amber-300/[.05] px-3 py-2 text-center text-xs text-amber-100">Corrigir integrações</a>}</section>
      <section className="mt-4 rounded-2xl border border-[#0b75c7] bg-[#03101b]/90 p-5"><p className="text-sm leading-6 text-[#c6d9ea]">“Mais do que uma IA,<br />um parceiro para o seu crescimento.”</p><p className="mt-4 text-right text-xl italic text-white/80">Samuel IA</p></section>
    </aside>
  );
}

function MobilePanel({ state, voiceActive, voiceError, onToggleVoice, onOpenConversation, onStop, onNavigate, onAction }: { state: string; voiceActive: boolean; voiceError: string | null; onToggleVoice: () => void; onOpenConversation: () => void; onStop: () => void; onNavigate: (section: WorkspaceSection) => void; onAction: (action: Action) => void }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[radial-gradient(circle_at_50%_18%,rgba(0,111,255,.2),transparent_32%),linear-gradient(180deg,#03101c,#02070c)] xl:hidden">
      <header className="flex items-center justify-between border-b border-white/[.06] px-4 py-3"><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-xl border border-cyan-300/30 text-lg font-black italic">S</div><div><strong className="block text-sm tracking-[.1em]">SAMUEL IA</strong><span className="text-[8px] tracking-[.18em] text-white/35">SF GROWTH AI</span></div></div><Bell className="size-5 text-white/60" /></header>
      <main className="flex-1 px-4 pb-24 pt-5">
        <div className="text-center"><p className="text-[8px] tracking-[.32em] text-[#9fc6e7]">MAIS AÇÕES. MAIS RESULTADOS.</p><h1 className="mt-2 text-3xl font-semibold tracking-[.08em]">SAMUEL IA</h1></div>
        <div className="relative mx-auto mt-4 size-[280px] max-w-[82vw]"><SamuelCore state={state} /></div>
        <div className="mx-auto mt-3 max-w-sm rounded-2xl border border-[#0878e9] bg-[#031326] px-4 py-3 text-center"><strong className="text-sm">{state === "speaking" ? "Respondendo..." : state === "thinking" ? "Pensando..." : voiceActive ? "Estou ouvindo..." : "Pronto para ajudar"}</strong><p className="mt-1 text-[10px] text-white/45">{voiceError || (voiceActive ? "Pode falar por cima de mim para interromper." : "Toque em Falar ou abra a conversa.")}</p></div>
        <div className="mt-5 flex items-start justify-center gap-8"><RoundControl icon={Keyboard} label="Digitar" onClick={onOpenConversation} compact /><button type="button" onClick={onToggleVoice} className="flex flex-col items-center gap-2 text-[10px] font-semibold"><span className="relative flex size-20 items-center justify-center rounded-full border border-[#0b71e6] bg-[radial-gradient(circle,#083671,#020b16)] shadow-[0_0_28px_rgba(0,152,255,.5)]"><span className={`absolute inset-[-8px] rounded-full border border-cyan-300/15 ${voiceActive ? "animate-ping" : "animate-pulse"}`} /><Mic className="size-8" /></span>{voiceActive ? "Ouvindo" : "Falar"}</button><RoundControl icon={Square} label="Parar" onClick={onStop} compact /></div>
        <div className="mt-6 grid grid-cols-2 gap-2">{RIGHT_ACTIONS.map((action) => <button key={action.label} type="button" onClick={() => onAction(action)} className="flex min-h-[78px] items-center gap-3 rounded-2xl border border-[#0a426e] bg-[#051321] p-3 text-left text-xs"><action.icon className="size-6 shrink-0 text-[#1cb4ff]" /><span>{action.label}</span></button>)}</div>
      </main>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-white/[.08] bg-[#07111c]/95 p-2 shadow-2xl backdrop-blur-xl"><MobileNav icon={Home} label="Início" onClick={() => onNavigate("samuel-ai")} /><MobileNav icon={CalendarDays} label="Agenda" onClick={() => onNavigate("executive-agenda")} /><MobileNav icon={Mic} label="Samuel" onClick={onOpenConversation} primary /><MobileNav icon={Mail} label="E-mail" onClick={() => onNavigate("gmail")} /><MobileNav icon={UsersRound} label="CRM" onClick={() => onNavigate("crm")} /></nav>
    </div>
  );
}

function SamuelCore({ state }: { state: string }) {
  const active = state !== "idle";
  return (
    <div className={`relative h-full w-full rounded-full transition-transform duration-500 ${active ? "scale-[1.025]" : ""}`}>
      <div className="absolute inset-0 animate-[spin_22s_linear_infinite] rounded-full border border-cyan-200/20 [background:repeating-conic-gradient(from_0deg,rgba(0,174,255,.72)_0deg_1.3deg,transparent_1.3deg_9deg)] [mask-image:radial-gradient(circle,transparent_62%,black_63%)]" />
      <div className="absolute inset-[4%] animate-[spin_13s_linear_infinite_reverse] rounded-full [background:conic-gradient(from_0deg,transparent,#006dff_18%,transparent_26%,#8b5cf6_43%,transparent_52%,#ffb87a_67%,transparent_76%,#04d9ff_90%,transparent)] [mask-image:radial-gradient(circle,transparent_73%,black_74%)]" />
      <div className="absolute inset-[9%] rounded-full bg-[conic-gradient(from_210deg,#04d9ff,#096dff_20%,#8c5bff_37%,#ffc084_52%,#18dfdf_72%,#0088ff_88%,#04d9ff)] p-[4px] shadow-[0_0_65px_rgba(0,150,255,.72),0_0_120px_rgba(83,74,255,.22)]">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#010814]">
          <div className="absolute -inset-[8%] animate-[spin_17s_linear_infinite] bg-[conic-gradient(from_20deg,transparent,#0a75ff66,transparent,#ac63ff66,transparent,#ffbb8c55,transparent,#00dcff66,transparent)] blur-[2px]" />
          <div className="absolute inset-[4%] animate-[spin_9s_linear_infinite_reverse] rounded-full opacity-95 [background:repeating-conic-gradient(from_0deg,transparent_0deg_7deg,rgba(38,189,255,.8)_8deg_9deg,transparent_10deg_19deg)] [mask-image:radial-gradient(circle,transparent_8%,black_34%,transparent_76%)]" />
          <div className={`absolute inset-[15%] rounded-full bg-[radial-gradient(circle_at_38%_30%,#0a72d9_0%,#063770_22%,#071c4d_40%,#06091d_66%,#010308_100%)] shadow-[inset_0_0_65px_rgba(0,184,255,.62),0_0_42px_rgba(0,174,255,.22)] ${active ? "animate-pulse" : ""}`} />
          <div className="absolute inset-[18%] animate-[spin_7s_linear_infinite] rounded-full [background:conic-gradient(from_0deg,transparent_0_8%,rgba(48,211,255,.72)_15%,transparent_23%_36%,rgba(139,92,246,.7)_44%,transparent_52%_65%,rgba(255,183,118,.62)_73%,transparent_82%)] [mask-image:radial-gradient(circle,transparent_0_38%,black_45%_63%,transparent_69%)]" />
          <div className="absolute left-[14%] top-[44%] h-[17%] w-[72%] animate-[spin_6s_linear_infinite_reverse] rounded-[50%] border-2 border-cyan-200/80 shadow-[0_0_22px_rgba(60,217,255,.8)]" />
          <div className="absolute left-[27%] top-[13%] h-[74%] w-[46%] animate-[spin_10s_linear_infinite] rounded-[50%] border-2 border-violet-300/65 shadow-[0_0_20px_rgba(165,90,255,.6)]" />
          <div className="absolute left-[23%] top-[24%] h-[54%] w-[58%] animate-[spin_8s_linear_infinite_reverse] rounded-[46%] border border-amber-200/45 shadow-[0_0_20px_rgba(255,182,113,.35)]" />
          <div className={`absolute left-1/2 top-1/2 size-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#8eeeff_0%,#1a80d8_18%,rgba(22,71,143,.65)_42%,rgba(4,13,34,.25)_68%,transparent_72%)] shadow-[0_0_45px_rgba(103,232,249,.65)] ${active ? "animate-pulse" : "animate-[pulse_3s_ease-in-out_infinite]"}`} />
          {Array.from({ length: 54 }, (_, index) => <i key={index} className="absolute size-[2px] animate-pulse rounded-full bg-cyan-100 shadow-[0_0_7px_#4de8ff]" style={{ left: `${9 + ((index * 37) % 82)}%`, top: `${8 + ((index * 53) % 84)}%`, animationDelay: `${(index % 10) * 90}ms`, opacity: .28 + (index % 6) * .11 }} />)}
        </div>
      </div>
    </div>
  );
}

function StatusPoint({ className, icon: Icon, title, text, color, active }: { className: string; icon: LucideIcon; title: string; text: ReactNode; color: string; active: boolean }) {
  return <div className={`absolute ${className} w-[160px] transition-opacity ${active ? "opacity-100" : "opacity-72"}`}><Icon className={`mb-2 size-8 ${active ? "animate-pulse" : ""}`} style={{ color, filter: `drop-shadow(0 0 10px ${color})` }} /><strong className="block text-sm text-[#e1efff]">{title}</strong><p className="mt-2 text-xs leading-5 text-[#9fc4e2]">{text}</p></div>;
}

function RoundControl({ icon: Icon, label, onClick, compact = false }: { icon: LucideIcon; label: string; onClick: () => void; compact?: boolean }) {
  return <button type="button" onClick={onClick} className="group mx-auto flex flex-col items-center gap-2 text-xs text-white"><span className={`flex ${compact ? "size-14" : "size-[64px]"} items-center justify-center rounded-full border border-[#0d65ac] bg-[#03101b] transition group-hover:border-[#2aaeff] group-hover:shadow-[0_0_20px_rgba(0,151,255,.18)]`}><Icon className={compact ? "size-5" : "size-6"} /></span>{label}</button>;
}

function StatusCheck({ label, good }: { label: string; good: boolean }) {
  return <div className="flex items-start gap-2"><span className={`mt-1 size-2 rounded-full ${good ? "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.65)]" : "bg-amber-300"}`} /><span>{label}</span></div>;
}

function InfoLine({ label, value, good }: { label: string; value: string; good: boolean }) {
  return <div className="rounded-xl border border-white/[.055] bg-white/[.025] p-3"><div className="text-[10px] uppercase tracking-[.16em] text-white/30">{label}</div><div className={`mt-1 text-sm ${good ? "text-emerald-100" : "text-amber-100"}`}>{value}</div></div>;
}

function MobileNav({ icon: Icon, label, onClick, primary = false }: { icon: LucideIcon; label: string; onClick: () => void; primary?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[8px] ${primary ? "bg-cyan-300/[.08] text-cyan-100" : "text-white/35"}`}><Icon className={primary ? "size-5" : "size-4"} /><span>{label}</span></button>;
}
