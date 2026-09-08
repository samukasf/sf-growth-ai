"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Inbox,
  Mail,
  Mic,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";

import { cn } from "@/utils/cn";
import type { WorkspaceSection } from "./workspace-navigation";

type GmailMessageSummary = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  unread: boolean;
};

type GmailMessage = GmailMessageSummary & {
  to: string;
  body: string;
};

type GmailResponse = {
  ok: boolean;
  summary: string;
  data?: { messages?: GmailMessageSummary[]; message?: GmailMessage };
  error?: string;
};

type Props = {
  companyId: string;
  onNavigate: (section: WorkspaceSection) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function GmailWorkspacePanel({ companyId, onNavigate }: Props) {
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selected, setSelected] = useState<GmailMessage | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const suffix = searchQuery?.trim() ? `&q=${encodeURIComponent(searchQuery.trim())}` : "";
      const response = await fetch(
        `/api/samuel-ai/gmail/panel?companyId=${encodeURIComponent(companyId)}${suffix}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as GmailResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || payload.summary || "Não foi possível carregar o Gmail.");
      }
      setMessages(payload.data?.messages ?? []);
    } catch (cause) {
      setMessages([]);
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar o Gmail.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  const unread = useMemo(() => messages.filter((message) => message.unread).length, [messages]);

  const openMessage = async (messageId: string) => {
    setReading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/samuel-ai/gmail/panel?companyId=${encodeURIComponent(companyId)}&messageId=${encodeURIComponent(messageId)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as GmailResponse;
      if (!response.ok || !payload.ok || !payload.data?.message) {
        throw new Error(payload.error || payload.summary || "Não foi possível abrir o e-mail.");
      }
      setSelected(payload.data.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível abrir o e-mail.");
    } finally {
      setReading(false);
    }
  };

  return (
    <section className="min-h-[calc(100dvh-130px)] overflow-hidden rounded-[28px] border border-white/[.07] bg-[#07111c] text-white shadow-[0_24px_80px_rgba(0,0,0,.28)]">
      <header className="flex flex-col gap-4 border-b border-white/[.07] bg-[linear-gradient(180deg,rgba(8,31,53,.82),rgba(5,17,29,.75))] p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[.08] text-cyan-200">
            <Mail className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-200/55">Google Workspace</p>
            <h2 className="mt-1 text-xl font-semibold text-white">E-mails</h2>
            <p className="mt-1 text-xs text-white/40">Inbox real da conta Gmail ligada à empresa.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate("samuel-ai")}
            className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-3.5 py-2.5 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-300/[.12]"
          >
            <Mic className="size-4" /> Comandar por voz
          </button>
          <button
            type="button"
            onClick={() => onNavigate("samuel-ai")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-xs font-semibold text-white/75 transition hover:bg-white/[.08]"
          >
            <Send className="size-4" /> Novo e-mail
          </button>
        </div>
      </header>

      <div className="grid min-h-0 xl:grid-cols-[390px_1fr]">
        <aside className="border-b border-white/[.06] bg-black/10 xl:border-b-0 xl:border-r">
          <div className="border-b border-white/[.06] p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void loadInbox(query);
              }}
              className="flex gap-2"
            >
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/[.07] bg-black/20 px-3 py-2.5">
                <Search className="size-4 text-white/30" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pesquisar no Gmail"
                  className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25"
                />
              </label>
              <button
                type="button"
                onClick={() => void loadInbox(query)}
                aria-label="Atualizar inbox"
                className="flex size-10 items-center justify-center rounded-xl border border-white/[.07] text-white/45 transition hover:bg-white/[.04] hover:text-white"
              >
                <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[.14em] text-white/25">
              <span>{messages.length} mensagens</span>
              <span>{unread} não lidas</span>
            </div>
          </div>

          <div className="max-h-[58dvh] overflow-y-auto xl:max-h-[calc(100dvh-285px)]">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/[.025]" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-5 text-center text-xs leading-relaxed text-white/35">Nenhum e-mail encontrado.</div>
            ) : (
              <div className="p-2">
                {messages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => void openMessage(message.id)}
                    className={cn(
                      "mb-1.5 w-full rounded-2xl border p-3 text-left transition",
                      selected?.id === message.id
                        ? "border-cyan-300/25 bg-cyan-300/[.07]"
                        : "border-transparent bg-white/[.018] hover:border-white/[.06] hover:bg-white/[.035]",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", message.unread ? "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,.6)]" : "bg-white/15")} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <strong className={cn("truncate text-xs", message.unread ? "text-white" : "text-white/60")}>{message.from}</strong>
                          <span className="shrink-0 text-[9px] text-white/20">{formatDate(message.date)}</span>
                        </div>
                        <p className="mt-1 truncate text-[11px] font-medium text-white/58">{message.subject || "(sem assunto)"}</p>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-white/28">{message.snippet}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="m-3 rounded-xl border border-amber-300/15 bg-amber-300/[.06] p-3 text-xs leading-relaxed text-amber-100/75">
              <p>{error}</p>
              <Link href="/integrations/google/connect" className="mt-2 inline-block font-semibold text-cyan-200 hover:text-cyan-100">
                Ligar Google Workspace
              </Link>
            </div>
          )}
        </aside>

        <main className="min-h-[430px] p-4 sm:p-6">
          {selected ? (
            <article className="mx-auto max-w-3xl">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mb-4 flex items-center gap-2 text-xs text-white/35 transition hover:text-white/70 xl:hidden"
              >
                <ArrowLeft className="size-4" /> Voltar à inbox
              </button>
              <p className="text-[10px] uppercase tracking-[.16em] text-cyan-200/45">Mensagem</p>
              <h3 className="mt-2 text-xl font-semibold text-white/90">{selected.subject || "(sem assunto)"}</h3>
              <div className="mt-4 rounded-2xl border border-white/[.06] bg-white/[.022] p-4 text-xs text-white/48">
                <p><span className="text-white/25">De:</span> {selected.from}</p>
                <p className="mt-1"><span className="text-white/25">Para:</span> {selected.to}</p>
                <p className="mt-1"><span className="text-white/25">Data:</span> {formatDate(selected.date)}</p>
              </div>
              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/[.06] bg-[#091522] p-5 text-sm leading-7 text-white/68">
                {selected.body || selected.snippet}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate("samuel-ai")}
                  className="rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-4 py-2.5 text-xs font-semibold text-cyan-50"
                >
                  Responder com Samuel
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("samuel-ai")}
                  className="rounded-xl border border-white/[.08] px-4 py-2.5 text-xs font-semibold text-white/55"
                >
                  Resumir por voz
                </button>
              </div>
            </article>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              {reading ? <RefreshCw className="size-9 animate-spin text-cyan-200/40" /> : <Inbox className="size-11 text-cyan-200/30" />}
              <strong className="mt-4 text-sm text-white/65">{reading ? "Abrindo e-mail…" : "Selecione uma mensagem"}</strong>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/30">Leia o conteúdo no painel ou peça ao Samuel para procurar, resumir, responder e preparar envios por voz.</p>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
