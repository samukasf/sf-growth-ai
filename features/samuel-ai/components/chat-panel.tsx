"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import { loadSamuelChatHistory } from "../chat/samuel-chat.client";
import { useSamuelRealtimeVoice } from "../realtime/use-samuel-realtime-voice";
import type {
  SamuelChatSendOptions,
  SamuelChatSendResult,
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
      return "Erro na voz";
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

function ExecutiveMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[90%] border-r-2 border-accent/40 pr-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Você
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {message.content}
          </p>
        </div>
        <span className="text-[11px] text-muted">{formatTime(message.timestamp)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "max-w-full rounded-lg border bg-white/[0.03] px-4 py-4",
          message.status === "error" ? "border-red-500/30" : "border-border",
        )}
      >
        <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
          <div className="flex size-7 items-center justify-center rounded-md border border-accent/30 bg-accent/10">
            <span className="text-[10px] font-bold text-accent">SA</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Samuel AI™</p>
            <p className="text-[10px] text-muted">
              {message.status === "streaming"
                ? "Samuel AI a responder…"
                : message.status === "cancelled"
                  ? "Resposta cancelada"
                  : message.status === "error"
                    ? "Falha na resposta"
                    : "Inteligência conversacional"}
            </p>
          </div>
          {message.status === "streaming" && (
            <span className="ml-auto size-2 animate-pulse rounded-full bg-accent" />
          )}
        </div>
        <div className="space-y-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {message.content || "A preparar a resposta com o contexto disponível…"}
        </div>
      </div>
      <span className="text-[11px] text-muted">{formatTime(message.timestamp)}</span>
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
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceAutoSend, setVoiceAutoSend] = useState(true);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const spokenAssistantRef = useRef<string | null>(null);
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
      window.speechSynthesis?.cancel();
    },
    [],
  );

  const speakSamuel = useCallback((content: string) => {
    if (!voiceReplyEnabled || typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    if (spokenAssistantRef.current === trimmed) return;

    spokenAssistantRef.current = trimmed;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.pitch = 0.92;
    window.speechSynthesis.speak(utterance);
  }, [voiceReplyEnabled]);

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
      if (!final || !content.trim()) return;
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
      if (role === "assistant") speakSamuel(content);
    },
    [speakSamuel],
  );
  const realtimeVoice = useSamuelRealtimeVoice({
    companyId,
    conversationId,
    contextSummary:
      "Samuel AI deve usar o contexto empresarial do workspace, a memória sincronizada e a identidade executiva preservada pelo SF Growth AI.",
    onTranscript: appendVoiceTranscript,
  });
  const realtimeActive = !["idle", "error"].includes(realtimeVoice.session.state);

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
              speakSamuel(event.message.content);
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
        speakSamuel(result.content);
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
    window.speechSynthesis?.cancel();

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
  }, [busy, hydrated, performSend, voiceAutoSend]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void performSend(input);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversa com Samuel AI"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:space-y-6 sm:p-6"
      >
        {!hasEngaged && (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.03] px-4 py-10 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_36px_rgba(34,211,238,0.18)]">
              SA
            </div>
            <p className="max-w-md text-sm text-muted">
              Converse com o Samuel AI sobre estratégia, tecnologia, ideias,
              escrita ou qualquer outro tema. Toque no microfone para conversar por voz.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ExecutiveMessage key={message.id} message={message} />
        ))}

        {warning && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
            {warning}
          </div>
        )}

        {(voiceNotice || realtimeVoice.session.error) && (
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-xs text-cyan-100/90">
            {voiceNotice || realtimeVoice.session.error}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-xs text-red-200/90">{error}</p>
            {lastFailedQuery && (
              <Button
                type="button"
                variant="secondary"
                className="h-8 shrink-0 px-3 text-xs"
                onClick={() => void performSend(lastFailedQuery, true)}
                disabled={busy}
              >
                Tentar novamente
              </Button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border bg-black/30 p-3 backdrop-blur-xl sm:p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Conversa
          </p>
          {providerLabel && (
            <p className="truncate text-[10px] text-muted">{providerLabel}</p>
          )}
        </div>
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                Voz Realtime
              </p>
              <p className="mt-1 text-xs text-cyan-100">
                {realtimeStateLabel(realtimeVoice.session.state)}
              </p>
            </div>
            <div
              aria-hidden="true"
              className="flex h-8 items-end gap-1"
              title="Visualizador de áudio"
            >
              {[0.28, 0.5, 0.8, 0.44, 0.64].map((weight, index) => (
                <span
                  key={weight}
                  className="w-1.5 rounded-full bg-cyan-300/70 transition-all"
                  style={{
                    height: `${8 + Math.round(realtimeVoice.session.audioLevel * weight * 28)}px`,
                    opacity: realtimeActive ? 1 : 0.35 + index * 0.08,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <button
              type="button"
              onClick={() => {
                if (realtimeActive) realtimeVoice.end();
                else void realtimeVoice.start();
              }}
              disabled={busy || !hydrated}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 font-medium transition",
                realtimeActive
                  ? "border-red-300/30 bg-red-400/10 text-red-100"
                  : "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
              )}
              aria-pressed={realtimeActive}
            >
              {realtimeActive ? "Encerrar voz" : "Iniciar conversa por voz"}
            </button>
            <button
              type="button"
              onClick={realtimeVoice.interrupt}
              disabled={!realtimeActive || realtimeVoice.session.state !== "speaking"}
              className="min-h-11 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 transition disabled:opacity-45"
            >
              Interromper Samuel
            </button>
            <button
              type="button"
              onClick={() => realtimeVoice.setMuted(!realtimeVoice.session.muted)}
              disabled={!realtimeActive}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 transition disabled:opacity-45",
                realtimeVoice.session.muted
                  ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              {realtimeVoice.session.muted ? "Ativar mic" : "Mute"}
            </button>
            <button
              type="button"
              onClick={() => realtimeVoice.setTextMode(!realtimeVoice.session.textMode)}
              disabled={!realtimeActive}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 transition disabled:opacity-45",
                realtimeVoice.session.textMode
                  ? "border-violet-300/30 bg-violet-300/10 text-violet-100"
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              {realtimeVoice.session.textMode ? "Voltar voz" : "Texto/voz"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Padrão tocar para falar para controlar custos. Se Realtime estiver indisponível,
            use o chat textual ou o ditado.
          </p>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <button
            type="button"
            onClick={() => setVoiceAutoSend((current) => !current)}
            className={cn(
              "rounded-full border px-3 py-1 transition",
              voiceAutoSend
                ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                : "border-border bg-white/[0.03]",
            )}
          >
            Voz envia automático
          </button>
          <button
            type="button"
            onClick={() => {
              setVoiceReplyEnabled((current) => !current);
              window.speechSynthesis?.cancel();
            }}
            className={cn(
              "rounded-full border px-3 py-1 transition",
              voiceReplyEnabled
                ? "border-violet-300/30 bg-violet-300/10 text-violet-100"
                : "border-border bg-white/[0.03]",
            )}
          >
            Samuel responde em voz
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem para o Samuel AI…"
            aria-label="Mensagem para o Samuel AI"
            disabled={busy || !hydrated}
            rows={2}
            className={cn(
              "min-h-[5rem] flex-1 resize-none rounded-xl border border-border bg-white/[0.03] px-3.5 py-3 text-sm text-foreground",
              "placeholder:text-zinc-600",
              "transition-colors duration-200",
              "hover:border-white/[0.12] hover:bg-white/[0.05]",
              "focus:border-accent/40 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-accent/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={listening ? stopVoiceInput : startVoiceInput}
            disabled={!hydrated || busy}
            className={cn(
              "shrink-0 sm:w-auto",
              listening &&
                "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)]",
            )}
          >
            {listening ? "Parar ditado" : "Ditado texto"}
          </Button>
          {busy ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => abortRef.current?.abort()}
              className="shrink-0 sm:w-auto"
            >
              Cancelar
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void performSend(input)}
              disabled={!hydrated || !input.trim() || !onSendMessage}
              className="shrink-0 sm:w-auto"
            >
              Enviar
            </Button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Enter para enviar · Shift+Enter para nova linha · Voz com Web Speech API do navegador
        </p>
      </div>
    </div>
  );
}
