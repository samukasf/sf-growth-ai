"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { RuntimeResponse } from "@/features/samuel-runtime";

import type { PlaygroundCompanyOption } from "../list-companies";
import { LivePipelineSimulator } from "./live-pipeline-simulator";
import { PipelineInspectorPanel } from "./pipeline-inspector-panel";

/** Testes rápidos predefinidos desta Sprint (76). */
const QUICK_TESTS = [
  "Quanto é 856 × 347?",
  "Crie uma campanha para minha empresa.",
  "Explique SEO e aplique na minha empresa.",
  "Responda meus e-mails.",
  "Analise meu faturamento.",
] as const;

const DEFAULT_ORGANIZATION_ID = "default-org";

type PlaygroundTurn = {
  id: string;
  query: string;
  organizationId: string;
  companyId?: string;
  companyName?: string;
  status: "pending" | "done" | "error";
  runtime?: RuntimeResponse;
  clientLatencyMs?: number;
  errorMessage?: string;
};

type SamuelPlaygroundPageProps = {
  companies: PlaygroundCompanyOption[];
};

/**
 * Samuel Playground — ferramenta oficial de desenvolvimento e depuração do
 * Samuel Runtime (Sprint 76). Consome exclusivamente o endpoint
 * `/api/samuel/runtime` já existente (nenhuma alteração de backend); esta
 * página só lê e apresenta os campos de `RuntimeResponse` de forma mais
 * detalhada do que a UI de produção em `/samuel`.
 *
 * `organizationId` permanece um campo de texto livre (com "default-org"
 * como padrão) — nenhuma alteração ao modelo multi-tenant nesta Sprint.
 */
export function SamuelPlaygroundPage({ companies }: SamuelPlaygroundPageProps) {
  const [organizationId, setOrganizationId] = useState(DEFAULT_ORGANIZATION_ID);
  const [companyId, setCompanyId] = useState<string | undefined>(companies[0]?.id);
  const [turns, setTurns] = useState<PlaygroundTurn[]>([]);
  const [input, setInput] = useState("");
  /**
   * Identifica a "conversa ativa" para a Conversation Memory (Sprint 81).
   * Todas as perguntas enviadas nesta página compartilham o mesmo
   * `conversationId` até que "Nova conversa" seja clicado — isso permite
   * testar a memória entre múltiplos testes rápidos em sequência.
   */
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID());
  const isBusy = turns.some((turn) => turn.status === "pending");

  const startNewConversation = useCallback(() => {
    if (isBusy) return;
    setConversationId(crypto.randomUUID());
    setTurns([]);
  }, [isBusy]);

  const selectedCompanyName = useMemo(
    () => companies.find((company) => company.id === companyId)?.name,
    [companies, companyId],
  );

  const sendQuery = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || isBusy) return;

      const turnId = crypto.randomUUID();
      const turnOrganizationId = organizationId.trim() || DEFAULT_ORGANIZATION_ID;
      const turnCompanyId = companyId;
      const turnCompanyName = selectedCompanyName;

      setTurns((prev) => [
        ...prev,
        {
          id: turnId,
          query: trimmed,
          organizationId: turnOrganizationId,
          companyId: turnCompanyId,
          companyName: turnCompanyName,
          status: "pending",
        },
      ]);
      setInput("");

      const startedAt = performance.now();

      try {
        const response = await fetch("/api/samuel/runtime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            organizationId: turnOrganizationId,
            companyId: turnCompanyId,
            companyName: turnCompanyName,
            conversationId,
          }),
        });

        const clientLatencyMs = performance.now() - startedAt;

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Falha ao processar a solicitação.");
        }

        const runtime = (await response.json()) as RuntimeResponse;

        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === turnId ? { ...turn, status: "done", runtime, clientLatencyMs } : turn,
          ),
        );
      } catch (error) {
        const clientLatencyMs = performance.now() - startedAt;
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";

        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === turnId ? { ...turn, status: "error", clientLatencyMs, errorMessage } : turn,
          ),
        );
      }
    },
    [companyId, conversationId, isBusy, organizationId, selectedCompanyName],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendQuery(input);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(59,130,246,0.12),transparent_55%)]"
      />

      <header className="relative shrink-0 border-b border-white/[0.06] bg-black/40 px-5 py-4 backdrop-blur-xl sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
          Samuel AI™ — ferramenta oficial de desenvolvimento e depuração
        </p>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Samuel Playground</h1>
        <p className="mt-1 text-sm text-muted">
          Execute perguntas e inspecione o pipeline completo do Samuel Runtime: Intent, contexto,
          memórias, Company Brain, Executive Council, provider/modelo de IA, tokens, custo, tempo por
          fase e resposta final.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <p className="text-xs text-muted">
            Conversa ativa: <span className="font-mono text-foreground/70">{conversationId.slice(0, 8)}</span>
            {" · "}
            {turns.length} turno(s)
          </p>
          <button
            type="button"
            onClick={startNewConversation}
            disabled={isBusy}
            className={cn(
              "rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs text-foreground/80",
              "transition-colors hover:border-accent/30 hover:bg-accent/5 hover:text-accent",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            Nova conversa
          </button>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-4xl flex-1 px-5 py-6 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted">
              Organization ID
            </span>
            <input
              type="text"
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              disabled={isBusy}
              placeholder={DEFAULT_ORGANIZATION_ID}
              className={cn(
                "w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-sm text-foreground",
                "placeholder:text-zinc-600",
                "transition-colors duration-200",
                "focus:border-accent/40 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-accent/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted">
              Company
            </span>
            <select
              value={companyId ?? ""}
              onChange={(event) => setCompanyId(event.target.value || undefined)}
              disabled={isBusy || companies.length === 0}
              className={cn(
                "w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-sm text-foreground",
                "transition-colors duration-200",
                "focus:border-accent/40 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-accent/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {companies.length === 0 && <option value="">Nenhuma empresa encontrada</option>}
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_TESTS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isBusy}
              onClick={() => void sendQuery(suggestion)}
              className={cn(
                "rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-xs text-foreground/80",
                "transition-colors hover:border-accent/30 hover:bg-accent/5 hover:text-accent",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma pergunta para inspecionar o pipeline do Samuel..."
            aria-label="Mensagem para o Samuel Playground"
            disabled={isBusy}
            rows={2}
            className={cn(
              "min-h-[3.5rem] flex-1 resize-none rounded-lg border border-border bg-white/[0.03] px-3.5 py-3 text-sm text-foreground",
              "placeholder:text-zinc-600",
              "transition-colors duration-200",
              "hover:border-white/[0.12] hover:bg-white/[0.05]",
              "focus:border-accent/40 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-accent/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
          <Button
            type="button"
            onClick={() => void sendQuery(input)}
            disabled={!input.trim() || isBusy}
            className="shrink-0"
          >
            {isBusy ? "Processando" : "Executar"}
          </Button>
        </div>

        <div className="mt-8 space-y-8">
          {turns.length === 0 && (
            <p className="text-sm text-muted">
              Envie uma pergunta acima para ver o pipeline completo do Samuel Runtime, fase a fase.
            </p>
          )}

          {[...turns].reverse().map((turn) => (
            <div key={turn.id} className="space-y-3">
              <div className="border-l-2 border-accent/40 pl-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Pergunta</p>
                <p className="mt-1 text-sm text-foreground">{turn.query}</p>
                <p className="mt-1 text-xs text-muted">
                  org: {turn.organizationId} · empresa: {turn.companyName ?? turn.companyId ?? "—"}
                </p>
              </div>

              {turn.status === "pending" && <LivePipelineSimulator />}

              {turn.status === "error" && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-red-400/80">
                    Status: Erro
                  </p>
                  <p className="mt-1">{turn.errorMessage}</p>
                </div>
              )}

              {turn.status === "done" && turn.runtime && (
                <PipelineInspectorPanel runtime={turn.runtime} clientLatencyMs={turn.clientLatencyMs ?? 0} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
