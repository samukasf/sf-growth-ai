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
            Diretriz
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
                ? "Samuel Runtime a responder…"
                : message.status === "cancelled"
                  ? "Análise cancelada"
                  : message.status === "error"
                    ? "Falha na análise"
                    : "Executive Intelligence"}
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
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => () => abortRef.current?.abort(), []);

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
                    content: message.content || "Análise cancelada.",
                    status: "cancelled",
                  }
                : message,
            ),
          );
        } else {
          const message =
            sendError instanceof Error
              ? sendError.message
              : "Não foi possível concluir a análise.";
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
    [busy, conversationId, hasEngaged, messages, onFirstMessage, onSendMessage],
  );

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
        aria-label="Canal executivo de comunicação"
        className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6"
      >
        {!hasEngaged && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted">
              Emita uma diretriz estratégica para iniciar o Samuel Runtime.
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

      <div className="shrink-0 border-t border-border bg-black/20 p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Canal executivo
          </p>
          {providerLabel && (
            <p className="truncate text-[10px] text-muted">{providerLabel}</p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Emita uma diretriz estratégica…"
            aria-label="Diretriz estratégica para o Samuel AI"
            disabled={busy || !hydrated}
            rows={2}
            className={cn(
              "min-h-[4.5rem] flex-1 resize-none rounded-lg border border-border bg-white/[0.03] px-3.5 py-3 text-sm text-foreground",
              "placeholder:text-zinc-600",
              "transition-colors duration-200",
              "hover:border-white/[0.12] hover:bg-white/[0.05]",
              "focus:border-accent/40 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-accent/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
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
              Executar
            </Button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Enter para executar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
