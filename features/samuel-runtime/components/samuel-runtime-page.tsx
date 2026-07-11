"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { RuntimeResponse } from "@/features/samuel-runtime";

import { SamuelAnalyzingIndicator } from "./samuel-analyzing-indicator";
import { SamuelRuntimeResponse } from "./samuel-runtime-response";
import { SamuelRuntimeSidebar } from "./samuel-runtime-sidebar";

const SUGGESTIONS = [
  "Analise minha empresa",
  "Quais são minhas prioridades?",
  "Crie uma campanha",
  "Quero vender mais",
  "Crie um site",
] as const;

type ChatEntry =
  | { id: string; role: "user"; content: string; timestamp: string }
  | { id: string; role: "assistant"; runtime: RuntimeResponse; timestamp: string };

type SamuelRuntimePageProps = {
  companyId?: string;
  companyName?: string;
  organizationId?: string;
};

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function SamuelRuntimePage({
  companyId,
  companyName,
  organizationId = "default-org",
}: SamuelRuntimePageProps) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());

  const hasConversation = entries.length > 0;

  const sidebarState = useMemo(() => {
    const lastAssistant = [...entries].reverse().find((entry) => entry.role === "assistant");
    if (lastAssistant?.role === "assistant") {
      return {
        companyBrainActive: lastAssistant.runtime.companyBrain.status === "active",
        councilReady: lastAssistant.runtime.executiveCouncil.status === "ready",
        lastUpdated: lastAssistant.runtime.generatedAt,
      };
    }

    return {
      companyBrainActive: true,
      councilReady: true,
      lastUpdated,
    };
  }, [entries, lastUpdated]);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isAnalyzing) return;

      const userEntry: ChatEntry = {
        id: createId("user"),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setEntries((prev) => [...prev, userEntry]);
      setInput("");
      setIsAnalyzing(true);

      try {
        const response = await fetch("/api/samuel/runtime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            companyId,
            companyName,
            organizationId,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao processar a solicitação.");
        }

        const runtime = (await response.json()) as RuntimeResponse;
        const assistantEntry: ChatEntry = {
          id: createId("assistant"),
          role: "assistant",
          runtime,
          timestamp: runtime.generatedAt,
        };

        setEntries((prev) => [...prev, assistantEntry]);
        setLastUpdated(runtime.generatedAt);
      } catch {
        const fallbackRuntime: RuntimeResponse = {
          query: trimmed,
          pipeline: [],
          memory: { summary: "Memória indisponível.", insights: [] },
          context: { objective: "Análise estratégica", fields: [] },
          companyBrain: {
            status: "inactive",
            headline: "Company Brain indisponível",
            facts: [],
            confidence: 0,
          },
          executiveCouncil: {
            status: "ready",
            memberCount: 0,
            consensus: "Não foi possível convocar o conselho neste momento.",
            specialists: [],
          },
          decision: {
            title: "Aguardando nova tentativa",
            rationale: "O runtime encontrou um erro temporário.",
            priority: "—",
            nextAction: "Tente enviar novamente em instantes.",
            confidence: 0,
          },
          response: {
            headline: "Análise indisponível",
            narrative:
              "Samuel não conseguiu concluir a análise. Verifique a conexão e tente novamente.",
            actionPlanSummary: "",
            actions: [],
            confidence: { score: 0, level: "baixa", rationale: "Erro de runtime" },
          },
          aiGateway: { used: false },
          generatedAt: new Date().toISOString(),
        };

        setEntries((prev) => [
          ...prev,
          {
            id: createId("assistant"),
            role: "assistant",
            runtime: fallbackRuntime,
            timestamp: fallbackRuntime.generatedAt,
          },
        ]);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [companyId, companyName, isAnalyzing, organizationId],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col xl:h-dvh xl:flex-row xl:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(59,130,246,0.12),transparent_55%)]"
      />

      <main className="relative flex min-h-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-white/[0.06] bg-black/40 px-5 py-4 backdrop-blur-xl sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
            Samuel AI™
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Runtime Alpha
          </h1>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {!hasConversation && (
            <div className="mx-auto max-w-2xl">
              <div className="rounded-xl border border-border bg-white/[0.02] px-6 py-8">
                <p className="text-xl font-semibold leading-snug text-foreground">
                  Bom dia, Samuel.
                </p>
                <p className="mt-2 text-base text-muted">
                  Enquanto você estava fora continuei trabalhando.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => void sendMessage(suggestion)}
                    className={cn(
                      "rounded-full border border-border bg-white/[0.03] px-4 py-2 text-sm text-foreground/90",
                      "transition-colors hover:border-accent/30 hover:bg-accent/5 hover:text-accent",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasConversation && (
            <div className="mx-auto max-w-3xl space-y-6">
              {entries.map((entry) =>
                entry.role === "user" ? (
                  <div key={entry.id} className="flex flex-col items-end gap-1">
                    <div className="max-w-[90%] border-r-2 border-accent/40 pr-4">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                        Você
                      </p>
                      <p className="mt-1 text-sm text-foreground">{entry.content}</p>
                    </div>
                  </div>
                ) : (
                  <SamuelRuntimeResponse key={entry.id} runtime={entry.runtime} />
                ),
              )}

              {isAnalyzing && <SamuelAnalyzingIndicator />}
            </div>
          )}

          {!hasConversation && isAnalyzing && (
            <div className="mx-auto mt-6 max-w-2xl">
              <SamuelAnalyzingIndicator />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-black/20 px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Converse naturalmente comigo..."
              aria-label="Mensagem para Samuel"
              disabled={isAnalyzing}
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
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || isAnalyzing}
              className="shrink-0"
            >
              {isAnalyzing ? "Analisando" : "Enviar"}
            </Button>
          </div>
        </div>
      </main>

      <div className="shrink-0 border-t border-white/[0.06] p-4 xl:w-80 xl:border-l xl:border-t-0 xl:p-5">
        <SamuelRuntimeSidebar
          lastUpdated={sidebarState.lastUpdated}
          companyBrainActive={sidebarState.companyBrainActive}
          councilReady={sidebarState.councilReady}
        />
      </div>
    </div>
  );
}
