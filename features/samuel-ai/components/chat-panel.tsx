"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AlertTriangle,
  Headphones,
  Mic,
  MicOff,
  Radio,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import { loadSamuelChatHistory } from "../chat/samuel-chat.client";
import {
  SamuelHologram,
  type SamuelHologramState,
} from "./samuel-hologram";
import { useSamuelRealtimeVoice } from "../realtime/use-samuel-realtime-voice";
import { useSamuelSpeech } from "../voice/use-samuel-speech";
import { useSamuelIdlePresence } from "../voice/use-samuel-idle-presence";
import type {
  SamuelChatSendOptions,
  SamuelChatSendResult,
  SamuelToolActionPlan,
  SamuelToolResult,
} from "../chat/samuel-chat.types";
import type { ChatMessage } from "../types";

type ChatPanelProps = {
  initialMessages: ChatMessage[];
  companyId: string;
  isProcessing?: boolean;
  onSendMessage?: (
    content: string,
    options: SamuelChatSendOptions,
  ) => Promise<SamuelChatSendResult>;
  onFirstMessage?: () => void;
};

type LocalHistory = {
  conversationId: string | null;
  messages: ChatMessage[];
};

function actionSurfaceLabel(action: SamuelToolActionPlan | null | undefined) {
  return action?.surface === "calendar" ? "Google Agenda" : "Gmail";
}

function actionSurfaceEndpoint(action: SamuelToolActionPlan) {
  return action.surface === "calendar"
    ? "/api/samuel-ai/calendar/actions"
    : "/api/samuel-ai/gmail/actions";
}

function resultSurfaceLabel(result: SamuelToolResult | null | undefined) {
  return result && "surface" in result && result.surface === "calendar"
    ? "Google Agenda"
    : "Gmail";
}

type BrowserSpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type BrowserSpeechRecognition = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionConstructor():
  | BrowserSpeechRecognitionConstructor
  | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window &
    typeof globalThis & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function createMessageId(role: ChatMessage["role"]) {
  return `${role}-${crypto.randomUUID()}`;
}

function storageKey(companyId: string) {
  return `sf-growth-ai:samuel-chat:${companyId}`;
}

function realtimeStateLabel(state: ReturnType<typeof useSamuelRealtimeVoice>["session"]["state"]) {
  switch (state) {
    case "requesting_permission":
      return "Solicitando microfone";
    case "listening":
      return "Ouvindo";
    case "processing":
      return "Processando";
    case "speaking":
      return "Samuel falando";
    case "paused":
      return "Pausado";
    case "error":
      return "Realtime indisponível";
    default:
      return "Inativo";
  }
}

function readLocalHistory(companyId: string): LocalHistory | null {
  try {
    const value = localStorage.getItem(storageKey(companyId));
    if (!value) return null;
    const parsed = JSON.parse(value) as LocalHistory;
    if (!Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function SpokenMessageText({
  content,
  wordIndex,
}: {
  content: string;
  wordIndex: number;
}) {
  let currentWord = -1;

  return content.split(/(\s+)/).map((part, index) => {
    if (/^\s+$/.test(part)) return part;
    currentWord += 1;
    return (
      <span
        key={`${index}-${part}`}
        className={cn(
          "samuel-message__spoken-word",
          currentWord < wordIndex && "is-complete",
          currentWord === wordIndex && "is-active",
        )}
      >
        {part}
      </span>
    );
  });
}

function ExecutiveMessage({
  message,
  speaking = false,
  spokenWordIndex = -1,
}: {
  message: ChatMessage;
  speaking?: boolean;
  spokenWordIndex?: number;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="samuel-message-row samuel-message-row--user">
        <div className="samuel-message samuel-message--user">
          <p className="samuel-message__author">
            Você
          </p>
          <p className="samuel-message__content">
            {message.content}
          </p>
        </div>
        <span className="samuel-message__time">{formatTime(message.timestamp)}</span>
      </div>
    );
  }

  return (
    <div className="samuel-message-row samuel-message-row--assistant">
      <div
        className={cn(
          "samuel-message samuel-message--assistant",
          message.status === "streaming" && "samuel-message--streaming",
          speaking && "samuel-message--speaking",
          message.status === "error" && "samuel-message--error",
        )}
      >
        <div className="samuel-message__header">
          <div className="samuel-message__avatar">
            <Sparkles aria-hidden="true" />
          </div>
          <div>
            <p className="samuel-message__name">Samuel AI™</p>
            <p className="samuel-message__status">
              {speaking
                ? "Samuel está falando"
                : message.status === "streaming"
                ? "A construir sua resposta…"
                : message.status === "cancelled"
                  ? "Resposta cancelada"
                  : message.status === "error"
                    ? "Falha na resposta"
                    : "Inteligência executiva"}
            </p>
          </div>
          {message.status === "streaming" && (
            <span className="samuel-message__thinking" aria-label="Samuel está respondendo" />
          )}
        </div>
        <div className={cn("samuel-message__content", message.status === "streaming" && "samuel-message__content--typing")}>
          {message.content ? (
            speaking ? (
              <SpokenMessageText content={message.content} wordIndex={spokenWordIndex} />
            ) : (
              message.content
            )
          ) : (
            "A preparar a resposta com o contexto disponível…"
          )}
        </div>
      </div>
      <span className="samuel-message__time">{formatTime(message.timestamp)}</span>
    </div>
  );
}

export function ChatPanel({
  initialMessages,
  companyId,
  isProcessing = false,
  onSendMessage,
  onFirstMessage,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState(false);
  const [pendingAction, setPendingAction] = useState<SamuelToolActionPlan | null>(null);
  const [actionResult, setActionResult] = useState<SamuelToolResult | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceAutoSend, setVoiceAutoSend] = useState(true);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [voiceConsoleOpen, setVoiceConsoleOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const presenceSleeping = useSamuelIdlePresence();
  const [activeBrowserMessageId, setActiveBrowserMessageId] = useState<string | null>(null);
  const [activeRealtimeMessageId, setActiveRealtimeMessageId] = useState<string | null>(null);
  const [realtimeSettling, setRealtimeSettling] = useState(false);
  const previousRealtimeStateRef = useRef<string>("idle");
  const {
    blocked: browserSpeechBlocked,
    cancel: cancelBrowserSpeech,
    engine: browserSpeechEngine,
    errorMessage: browserSpeechError,
    loadProgress: browserVoiceLoadProgress,
    mouthLevel: browserMouthLevel,
    progress: browserSpeechProgress,
    settling: browserSpeechSettling,
    speak: speakBrowserSpeech,
    speaking: browserSpeaking,
    status: browserSpeechStatus,
    supported: browserSpeechSupported,
    voiceLabel: browserVoiceLabel,
    wordIndex: browserSpeechWordIndex,
  } = useSamuelSpeech({ enabled: voiceReplyEnabled });
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const spokenAssistantRef = useRef<string | null>(null);
  const realtimeAssistantMessageRef = useRef<string | null>(null);
  const hasEngaged = messages.length > 0;
  const busy = sending || isProcessing;
  useEffect(() => {
    const controller = new AbortController();
    const local = readLocalHistory(companyId);

    void loadSamuelChatHistory(companyId, controller.signal)
      .then((history) => {
        const hasRemoteHistory = history.messages.length > 0 || history.conversationId;
        setMessages(hasRemoteHistory ? history.messages : local?.messages ?? initialMessages);
        setConversationId(
          hasRemoteHistory ? history.conversationId : local?.conversationId ?? null,
        );
      })
      .catch((historyError: unknown) => {
        if (!controller.signal.aborted) {
          setMessages(local?.messages ?? initialMessages);
          setConversationId(local?.conversationId ?? null);
          setWarning(
            historyError instanceof Error
              ? `Histórico remoto indisponível: ${historyError.message}`
              : "Histórico remoto indisponível; a conversa continuará neste dispositivo.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setHydrated(true);
      });

    return () => controller.abort();
  }, [companyId, initialMessages]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        storageKey(companyId),
        JSON.stringify({ conversationId, messages } satisfies LocalHistory),
      );
    } catch {
      // Private browsing or storage quotas may disable the local fallback.
    }
  }, [companyId, conversationId, hydrated, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      recognitionRef.current?.abort();
      cancelBrowserSpeech();
    },
    [cancelBrowserSpeech],
  );

  const speakSamuel = useCallback((content: string, messageId: string, force = false) => {
    if (!voiceReplyEnabled) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!force && spokenAssistantRef.current === trimmed) return;

    spokenAssistantRef.current = trimmed;
    setActiveBrowserMessageId(messageId);
    const launched = speakBrowserSpeech(trimmed, {
      onEnd: () => setActiveBrowserMessageId((current) => current === messageId ? null : current),
      onError: () => setActiveBrowserMessageId((current) => current === messageId ? null : current),
    });
    if (!launched) setActiveBrowserMessageId(null);
  }, [speakBrowserSpeech, voiceReplyEnabled]);

  const appendVoiceTranscript = useCallback(
    ({
      role,
      content,
      final,
    }: {
      role: ChatMessage["role"];
      content: string;
      final: boolean;
    }) => {
      if (!content || (final && !content.trim())) return;

      if (role === "user") {
        if (!final) return;
        realtimeAssistantMessageRef.current = null;
        setMessages((current) => [
          ...current,
          {
            id: createMessageId(role),
            role,
            content: content.trim(),
            timestamp: new Date().toISOString(),
            status: "complete",
          },
        ]);
        return;
      }

      let messageId = realtimeAssistantMessageRef.current;
      if (!messageId) {
        if (!content.trim()) return;
        const createdMessageId = createMessageId("assistant");
        messageId = createdMessageId;
        realtimeAssistantMessageRef.current = createdMessageId;
        setActiveRealtimeMessageId(createdMessageId);
        setMessages((current) => [
          ...current,
          {
            id: createdMessageId,
            role: "assistant",
            content: final ? content.trim() : content,
            timestamp: new Date().toISOString(),
            status: final ? "complete" : "streaming",
          },
        ]);
        return;
      }

      setActiveRealtimeMessageId(messageId);
      setMessages((current) => current.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content: final ? content.trim() : `${message.content}${content}`,
              status: final ? "complete" : "streaming",
            }
          : message,
      ));
    },
    [],
  );
  const realtimeVoice = useSamuelRealtimeVoice({
    companyId,
    conversationId,
    contextSummary:
      "Samuel AI deve usar o contexto empresarial do workspace, a memória sincronizada e a identidade executiva preservada pelo SF Growth AI.",
    onTranscript: appendVoiceTranscript,
  });

  useEffect(() => {
    const previous = previousRealtimeStateRef.current;
    const current = realtimeVoice.session.state;
    previousRealtimeStateRef.current = current;

    if (current === "speaking") {
      const resetTimer = window.setTimeout(() => setRealtimeSettling(false), 0);
      return () => window.clearTimeout(resetTimer);
    }
    if (previous !== "speaking") return;

    const startTimer = window.setTimeout(() => setRealtimeSettling(true), 0);
    const endTimer = window.setTimeout(() => setRealtimeSettling(false), 650);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [realtimeVoice.session.state]);

  const realtimeActive = !["idle", "error"].includes(realtimeVoice.session.state);
  const samuelSpeaking =
    browserSpeaking || realtimeVoice.session.state === "speaking";
  const realtimeSpeechWordIndex = useMemo(
    () => Math.max(0, realtimeVoice.session.assistantTranscript.trim().split(/\s+/).length - 1),
    [realtimeVoice.session.assistantTranscript],
  );
  const activeSpokenMessageId = browserSpeaking
    ? activeBrowserMessageId
    : realtimeVoice.session.state === "speaking"
      ? activeRealtimeMessageId
      : null;
  const activeSpokenWordIndex = browserSpeaking
    ? browserSpeechWordIndex
    : realtimeSpeechWordIndex;
  const hologramAudioLevel = browserSpeaking
    ? browserMouthLevel
    : realtimeVoice.session.state === "speaking"
      ? Math.min(1, Math.max(0.24, realtimeVoice.session.outputAudioLevel * 3.2))
      : 0;
  const hologramSpeechProgress = browserSpeaking
    ? browserSpeechProgress
    : realtimeVoice.session.state === "speaking"
      ? (realtimeSpeechWordIndex % 24) / 24
      : 0;
  const hologramState: SamuelHologramState = samuelSpeaking
    ? "speaking"
    : realtimeVoice.session.state === "error"
      ? "error"
      : browserSpeechSettling || realtimeSettling || listening || realtimeVoice.session.state === "listening"
        ? "listening"
        : busy || realtimeVoice.session.state === "processing"
          ? "processing"
          : realtimeVoice.session.state === "requesting_permission"
            ? "executing"
            : presenceSleeping
              ? "sleeping"
              : "resting";
  const lastAssistantMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "assistant" &&
            message.status !== "streaming" &&
            message.content.trim(),
        ) ?? null,
    [messages],
  );
  const visibleMessages = useMemo(
    () => (historyExpanded ? messages : messages.slice(-12)),
    [historyExpanded, messages],
  );
  const hiddenMessageCount = Math.max(0, messages.length - visibleMessages.length);
  const liveCaption = useMemo(() => {
    const activeMessage = messages.find((message) => message.id === activeSpokenMessageId);
    const source =
      activeMessage?.content ||
      lastAssistantMessage?.content ||
      "Fale por voz ou escreva uma instrução. O holograma é o Samuel AI em modo executivo.";
    return source.length > 210 ? `${source.slice(0, 210).trim()}…` : source;
  }, [activeSpokenMessageId, lastAssistantMessage?.content, messages]);

  const performSend = useCallback(
    async (rawContent: string, retry = false) => {
      const trimmed = rawContent.trim();
      if (!trimmed || busy || !onSendMessage) return;

      if (!hasEngaged) onFirstMessage?.();

      const withoutFailedAssistant = retry
        ? messages.filter((message) => message.status !== "error")
        : messages;
      const userMessage: ChatMessage = {
        id: createMessageId("user"),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
        status: "complete",
      };
      const assistantId = createMessageId("assistant");
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        status: "streaming",
      };
      const nextMessages = retry
        ? [...withoutFailedAssistant, assistantMessage]
        : [...withoutFailedAssistant, userMessage, assistantMessage];
      let history = withoutFailedAssistant.filter(
        (message) => !message.status || message.status === "complete",
      );
      if (
        retry &&
        history.at(-1)?.role === "user" &&
        history.at(-1)?.content === trimmed
      ) {
        history = history.slice(0, -1);
      }

      setMessages(nextMessages);
      setInput("");
      setSending(true);
      setError(null);
      setWarning(null);
      setProviderLabel(null);
      setLastFailedQuery(null);
      setPendingAction(null);
      setActionResult(null);
      setHistoryExpanded(false);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await onSendMessage(trimmed, {
          conversationId,
          history,
          signal: controller.signal,
          onEvent(event) {
            if (event.type === "start") setConversationId(event.conversationId);
            if (event.type === "warning") setWarning(event.message);
            if (event.type === "provider") {
              setProviderLabel(
                event.model ? `${event.provider} · ${event.model}` : event.provider,
              );
            }
            if (event.type === "action_proposal") {
              setPendingAction(event.action);
            }
            if (event.type === "action_result") {
              setActionResult(event.result);
            }
            if (event.type === "delta") {
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: message.content + event.delta }
                    : message,
                ),
              );
            }
            if (event.type === "complete") {
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId ? event.message : message,
                ),
              );
              setConversationId(event.conversationId);
              if (event.pendingAction) setPendingAction(event.pendingAction);
              speakSamuel(event.message.content, event.message.id);
            }
          },
        });

        setConversationId(result.conversationId);
        setProviderLabel(
          result.model ? `${result.provider} · ${result.model}` : result.provider,
        );
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: result.content, status: "complete" }
              : message,
          ),
        );
        speakSamuel(result.content, assistantId);
      } catch (sendError) {
        const cancelled =
          controller.signal.aborted ||
          (sendError instanceof DOMException && sendError.name === "AbortError");
        if (cancelled) {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: message.content || "Resposta cancelada.",
                    status: "cancelled",
                  }
                : message,
            ),
          );
        } else {
          const message =
            sendError instanceof Error
              ? sendError.message
              : "Não foi possível concluir a resposta.";
          setError(message);
          setLastFailedQuery(trimmed);
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantId
                ? {
                    ...item,
                    content: item.content || message,
                    status: "error",
                  }
                : item,
            ),
          );
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setSending(false);
      }
    },
    [
      busy,
      conversationId,
      hasEngaged,
      messages,
      onFirstMessage,
      onSendMessage,
      speakSamuel,
    ],
  );

  const stopVoiceInput = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startVoiceInput = useCallback(() => {
    if (busy || !hydrated) return;

    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setVoiceNotice(
        "Este navegador ainda não suporta captura de voz. Use Chrome, Edge ou Safari atualizado.",
      );
      return;
    }

    recognitionRef.current?.abort();
    cancelBrowserSpeech();

    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript ?? "";
        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const nextInput = `${finalTranscript}${interimTranscript}`.trimStart();
      setInput(nextInput);
      setVoiceNotice(interimTranscript ? "Samuel está ouvindo…" : null);
    };

    recognition.onerror = () => {
      setVoiceNotice("Não consegui captar o áudio. Verifique a permissão do microfone.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;

      const transcript = finalTranscript.trim();
      if (voiceAutoSend && transcript) {
        void performSend(transcript);
      } else if (transcript) {
        setVoiceNotice("Mensagem de voz transcrita. Revise e envie quando quiser.");
      }
    };

    recognitionRef.current = recognition;
    setListening(true);
    setVoiceNotice("Samuel está ouvindo… fale naturalmente.");
    recognition.start();
  }, [busy, cancelBrowserSpeech, hydrated, performSend, voiceAutoSend]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void performSend(input);
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction?.confirmationToken || confirmingAction) return;
    const target = actionSurfaceLabel(pendingAction);
    setConfirmingAction(true);
    setError(null);
    try {
      const response = await fetch(actionSurfaceEndpoint(pendingAction), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          actionId: pendingAction.actionId,
          args: pendingAction.args,
          confirmationToken: pendingAction.confirmationToken,
          confirm: true,
        }),
      });
      const payload = (await response.json()) as SamuelToolResult & { error?: string };
      if (!response.ok && !payload.summary) {
        throw new Error(payload.error || `Falha ao confirmar ação no ${target}.`);
      }
      setActionResult(payload);
      setPendingAction(null);
      setMessages((current) => [
        ...current,
        {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${pendingAction.surface}-${Date.now()}`,
          role: "assistant",
          content: payload.ok
            ? `✅ Ação executada no ${target}.\n\n${payload.summary}`
            : `❌ Não consegui executar no ${target}.\n\n${payload.summary || payload.error}`,
          timestamp: new Date().toISOString(),
          status: "complete",
        },
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Falha ao confirmar ação no ${target}.`);
    } finally {
      setConfirmingAction(false);
    }
  }

  return (
    <div className="samuel-chat-shell samuel-chat-shell--hologram">
      <div className={cn("samuel-chat-presence", samuelSpeaking && "samuel-chat-presence--speaking")}>
        <SamuelHologram
          state={hologramState}
          audioLevel={hologramAudioLevel}
          speechProgress={hologramSpeechProgress}
          smiling={browserSpeechSettling || realtimeSettling}
        />
        <div className="samuel-chat-presence__copy">
          <span>Samuel AI · presença executiva</span>
          <strong>
            {samuelSpeaking
              ? "Estou falando com você"
              : browserSpeechSettling || realtimeSettling || realtimeVoice.session.state === "listening"
                ? "Estou ouvindo"
                : busy
                  ? "Estou analisando"
                  : "Estou online e atento"}
          </strong>
          <p>
            O holograma é o Samuel. A voz, a boca, os olhos e a mensagem ativa trabalham juntos.
          </p>
          <blockquote className="samuel-chat-presence__caption">
            {liveCaption}
          </blockquote>
        </div>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Conversa com Samuel AI"
        className="samuel-chat-log"
      >
        <div className="samuel-chat-history-header">
          <div>
            <span>Histórico compacto</span>
            <strong>Conversa com Samuel</strong>
          </div>
          <button
            type="button"
            onClick={() => setHistoryExpanded((current) => !current)}
            disabled={messages.length <= 12}
          >
            {historyExpanded ? "Compactar" : `Ver tudo${hiddenMessageCount ? ` (+${hiddenMessageCount})` : ""}`}
          </button>
        </div>

        {!hasEngaged && (
          <div className="samuel-chat-empty">
            <div className="samuel-chat-empty__icon">
              <Sparkles aria-hidden="true" />
            </div>
            <strong>Samuel está pronto para começar</strong>
            <p>
              Escreva sua mensagem ou use o microfone. As respostas podem ser
              reproduzidas com a voz masculina do Samuel.
            </p>
          </div>
        )}

        {hiddenMessageCount > 0 && !historyExpanded && (
          <button
            type="button"
            className="samuel-chat-history-hint"
            onClick={() => setHistoryExpanded(true)}
          >
            {hiddenMessageCount} mensagem(ns) anterior(es) ocultas para manter a tela leve. Tocar para expandir.
          </button>
        )}

        {visibleMessages.map((message) => {
          const speakingMessage = message.id === activeSpokenMessageId;
          return (
            <ExecutiveMessage
              key={message.id}
              message={message}
              speaking={speakingMessage}
              spokenWordIndex={speakingMessage ? activeSpokenWordIndex : -1}
            />
          );
        })}

        {warning && (
          <div className="samuel-chat-notice samuel-chat-notice--warning">
            {warning}
          </div>
        )}

        {(voiceNotice || browserSpeechBlocked || browserSpeechError) && (
          <div className="samuel-chat-notice samuel-chat-notice--voice">
            {voiceNotice ||
              browserSpeechError ||
              "O navegador bloqueou a reprodução automática. Use “Ouvir última resposta” para liberar a voz."}
          </div>
        )}

        {error && (
          <div className="samuel-chat-notice samuel-chat-notice--error">
            <p>{error}</p>
            {lastFailedQuery && (
              <Button
                type="button"
                variant="secondary"
                className="h-8 shrink-0 border-red-200 bg-white px-3 text-xs text-red-700"
                onClick={() => void performSend(lastFailedQuery, true)}
                disabled={busy}
              >
                Tentar novamente
              </Button>
            )}
          </div>
        )}

        {pendingAction ? (
          <div className="rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Confirmação {actionSurfaceLabel(pendingAction)}
            </p>
            <p className="mt-1 font-semibold">{pendingAction.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
              {pendingAction.preview}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-9 px-3 text-xs"
                disabled={confirmingAction || busy}
                onClick={() => void confirmPendingAction()}
              >
                {confirmingAction ? "A executar…" : "Confirmar e executar"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 px-3 text-xs"
                disabled={confirmingAction}
                onClick={() => setPendingAction(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}

        {actionResult && !pendingAction ? (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-xs",
              actionResult.ok
                ? "border-emerald-300/50 bg-emerald-50 text-emerald-950"
                : "border-rose-300/50 bg-rose-50 text-rose-950",
            )}
          >
            <p className="font-semibold">
              {actionResult.ok
                ? `${resultSurfaceLabel(actionResult)} atualizado`
                : `Falha no ${resultSurfaceLabel(actionResult)}`}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{actionResult.summary}</p>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <div className="samuel-chat-composer">
        <div className="samuel-chat-composer__heading">
          <div>
            <span>Canal executivo seguro</span>
            <strong>Converse com Samuel</strong>
          </div>
          {providerLabel && (
            <p>{providerLabel}</p>
          )}
        </div>

        <div
          className={cn(
            "samuel-voice-console",
            (realtimeActive || browserSpeaking || browserSpeechStatus === "preparing") && "samuel-voice-console--active",
            samuelSpeaking && "samuel-voice-console--speaking",
            realtimeVoice.session.state === "error" && "samuel-voice-console--error",
          )}
        >
          <div className="samuel-voice-console__topline">
            <div className="samuel-voice-console__identity">
              <span><Radio aria-hidden="true" /></span>
              <div>
                <p>Samuel Voice · masculina</p>
                <strong>
                  {browserSpeechStatus === "preparing"
                    ? `Preparando voz local · ${Math.round(browserVoiceLoadProgress * 100)}%`
                    : browserSpeaking
                      ? `${browserVoiceLabel ?? "Piper pt-BR"} · falando`
                      : realtimeActive
                        ? realtimeStateLabel(realtimeVoice.session.state)
                        : browserVoiceLabel
                          ? `${browserVoiceLabel} · pronta`
                          : "Voz neural local pronta"}
                </strong>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="samuel-voice-console__meter"
              title="Visualizador de áudio"
            >
              {[0.28, 0.5, 0.8, 0.44, 0.64].map((weight, index) => (
                <span
                  key={weight}
                  style={{
                    height: `${8 + Math.round((browserSpeaking ? browserMouthLevel : realtimeVoice.session.state === "speaking" ? realtimeVoice.session.outputAudioLevel : realtimeVoice.session.audioLevel) * weight * 28)}px`,
                    opacity: realtimeActive || browserSpeaking ? 1 : 0.35 + index * 0.08,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="samuel-voice-console__primary-actions">
            <button
              type="button"
              onClick={() => {
                if (realtimeActive) realtimeVoice.end();
                else {
                  setVoiceConsoleOpen(true);
                  void realtimeVoice.start();
                }
              }}
              disabled={busy || !hydrated}
              className="samuel-voice-console__start"
              aria-pressed={realtimeActive}
            >
              {realtimeActive ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
              {realtimeActive
                ? "Encerrar conversa"
                : realtimeVoice.session.state === "error"
                  ? "Tentar voz novamente"
                  : "Iniciar conversa por voz"}
            </button>
            <button
              type="button"
              onClick={() => setVoiceConsoleOpen((current) => !current)}
              className="samuel-voice-console__settings"
              aria-expanded={voiceConsoleOpen}
            >
              <SlidersHorizontal aria-hidden="true" />
              {voiceConsoleOpen ? "Ocultar ajustes" : "Ajustes"}
            </button>
          </div>

          {realtimeVoice.session.error && (
            <div className="samuel-voice-console__error" role="alert">
              <AlertTriangle aria-hidden="true" />
              <div>
                <strong>Realtime indisponível · fallback local disponível</strong>
                <p>{realtimeVoice.session.error}</p>
                <span>
                  {browserSpeechEngine === "piper-local"
                    ? "A voz neural masculina pt-BR continua ativa neste aparelho."
                    : "Toque em “Ouvir resposta” para carregar a voz neural masculina pt-BR."}
                </span>
              </div>
            </div>
          )}

          {(voiceConsoleOpen || realtimeActive) && (
            <div className="samuel-voice-console__details">
              <div className="samuel-voice-console__controls">
                <button
                  type="button"
                  onClick={realtimeVoice.interrupt}
                  disabled={!realtimeActive || realtimeVoice.session.state !== "speaking"}
                >
                  <VolumeX aria-hidden="true" /> Interromper Samuel
                </button>
                <button
                  type="button"
                  onClick={() => realtimeVoice.setMuted(!realtimeVoice.session.muted)}
                  disabled={!realtimeActive}
                >
                  {realtimeVoice.session.muted ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
                  {realtimeVoice.session.muted ? "Ativar microfone" : "Silenciar microfone"}
                </button>
                <button
                  type="button"
                  onClick={() => realtimeVoice.setTextMode(!realtimeVoice.session.textMode)}
                  disabled={!realtimeActive}
                >
                  <Headphones aria-hidden="true" />
                  {realtimeVoice.session.textMode ? "Retomar conversa" : "Somente resposta"}
                </button>
              </div>
              <p>Toque para iniciar. A conversa Realtime usa microfone e encerra automaticamente.</p>
            </div>
          )}
        </div>

        <div className="samuel-chat-voice-options">
          <button
            type="button"
            onClick={() => setVoiceAutoSend((current) => !current)}
            className={cn(
              "samuel-chat-voice-option",
              voiceAutoSend && "samuel-chat-voice-option--active",
            )}
          >
            <Mic aria-hidden="true" /> Ditado envia sozinho
          </button>
          <button
            type="button"
            onClick={() => {
              setVoiceReplyEnabled((current) => !current);
              cancelBrowserSpeech();
            }}
            className={cn(
              "samuel-chat-voice-option",
              voiceReplyEnabled && "samuel-chat-voice-option--active",
            )}
          >
            {voiceReplyEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            Voz masculina {voiceReplyEnabled ? "ativa" : "desativada"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (lastAssistantMessage) {
                speakSamuel(lastAssistantMessage.content, lastAssistantMessage.id, true);
              }
            }}
            disabled={!lastAssistantMessage || !browserSpeechSupported}
            className="samuel-chat-voice-option"
          >
            <RotateCcw aria-hidden="true" /> Ouvir resposta
          </button>
        </div>

        <div className="samuel-chat-input-grid">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem para o Samuel AI…"
            aria-label="Mensagem para o Samuel AI"
            disabled={busy || !hydrated}
            rows={2}
            className="samuel-chat-textarea"
          />
          <div className="samuel-chat-input-actions">
            <button
              type="button"
              onClick={listening ? stopVoiceInput : startVoiceInput}
              disabled={!hydrated || busy}
              className={cn("samuel-chat-dictation", listening && "is-listening")}
            >
              {listening ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
              {listening ? "Parar" : "Ditado"}
            </button>
            {busy ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="samuel-chat-send is-cancel"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void performSend(input)}
                disabled={!hydrated || !input.trim() || !onSendMessage}
                className="samuel-chat-send"
              >
                <Send aria-hidden="true" /> Enviar
              </button>
            )}
          </div>
        </div>
        <p className="samuel-chat-composer__helper">
          Enter envia · Shift+Enter cria uma nova linha · Samuel pode ler a resposta em voz alta
        </p>
      </div>
    </div>
  );
}
