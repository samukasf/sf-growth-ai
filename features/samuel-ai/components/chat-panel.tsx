"use client";

import { useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import type { ChatMessage } from "../types";

type ChatPanelProps = {
  initialMessages: ChatMessage[];
  isProcessing?: boolean;
  onSendMessage?: (content: string) => Promise<string>;
  onFirstMessage?: () => void;
};

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function createMessageId(role: ChatMessage["role"]) {
  return `${role}-${crypto.randomUUID()}`;
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
          <p className="mt-1 text-sm text-foreground">{message.content}</p>
        </div>
        <span className="text-[11px] text-muted">{formatTime(message.timestamp)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="max-w-full rounded-lg border border-border bg-white/[0.03] px-4 py-4">
        <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
          <div className="flex size-7 items-center justify-center rounded-md border border-accent/30 bg-accent/10">
            <span className="text-[10px] font-bold text-accent">SA</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Samuel AI™</p>
            <p className="text-[10px] text-muted">Executive Intelligence</p>
          </div>
        </div>
        <div className="space-y-0.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
          {message.content.split("\n").map((line, index) => (
            <p
              key={`${message.id}-line-${index}`}
              className={cn(
                line.length === 0 && "h-2",
                line.startsWith("Diretriz") && "font-medium text-accent",
                line.startsWith("Impacto") && "text-emerald-400/90",
                line.startsWith("Ação imediata") && "text-foreground",
              )}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
      <span className="text-[11px] text-muted">{formatTime(message.timestamp)}</span>
    </div>
  );
}

export function ChatPanel({
  initialMessages,
  isProcessing = false,
  onSendMessage,
  onFirstMessage,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasEngaged, setHasEngaged] = useState(false);
  const [input, setInput] = useState("");

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    if (!hasEngaged) {
      setHasEngaged(true);
      onFirstMessage?.();
    }

    const userMessage: ChatMessage = {
      id: createMessageId("user"),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const assistantContent = onSendMessage
      ? await onSendMessage(trimmed)
      : "Análise em processamento. O Executive Brain está construindo o contexto estratégico.";

    const assistantMessage: ChatMessage = {
      id: createMessageId("assistant"),
      role: "assistant",
      content: assistantContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  const displayMessages = hasEngaged ? messages : initialMessages;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        role="log"
        aria-live="polite"
        aria-label="Canal executivo de comunicação"
        className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6"
      >
        {!hasEngaged && displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted">
              Emita uma diretriz estratégica para iniciar a análise executiva.
            </p>
          </div>
        )}

        {displayMessages.map((message) => (
          <ExecutiveMessage key={message.id} message={message} />
        ))}

        {isProcessing && (
          <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-2 animate-pulse rounded-full bg-accent"
              />
              <div>
                <p className="text-xs font-semibold text-accent">
                  Executive Brain em análise
                </p>
                <p className="text-xs text-muted">
                  Consultando Conselho Executivo e fontes de inteligência…
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-black/20 p-4 sm:p-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Canal executivo
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Emita uma diretriz estratégica…"
            aria-label="Diretriz estratégica para o Samuel AI"
            disabled={isProcessing}
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
          <Button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isProcessing}
            className="shrink-0 sm:w-auto"
          >
            {isProcessing ? "Analisando" : "Executar"}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Enter para executar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
