"use client";

import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";

/**
 * O endpoint `/api/samuel/runtime` hoje responde de forma síncrona (uma
 * única resposta JSON ao final do pipeline) — não há streaming/SSE de fases
 * individuais. Alterar isso seria uma mudança de arquitetura da API, fora
 * do escopo desta ferramenta de inspeção.
 *
 * Este componente é APENAS uma animação visual otimista enquanto a
 * requisição está em voo, para dar feedback de progresso. As fases reais
 * (com status e ordem exatos devolvidos pelo runtime) só aparecem depois
 * que a resposta chega, via `PipelineStepTracker`.
 */
const LOADING_PHASE_LABELS = [
  "Intent Router",
  "Samuel Orchestrator",
  "Memory",
  "Context",
  "Company Brain",
  "Executive Council",
  "Decision",
  "Response",
] as const;

export function LivePipelineSimulator() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % LOADING_PHASE_LABELS.length);
    }, 350);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-white/[0.02] p-4">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted">
        Processando pipeline — animação aproximada; os dados reais aparecem abaixo ao concluir
      </p>
      <ol className="flex flex-wrap gap-2">
        {LOADING_PHASE_LABELS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted",
              index === activeIndex && "border-accent/40 bg-accent/5 text-accent",
              index < activeIndex && "text-foreground/70",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full bg-white/20",
                index === activeIndex && "bg-accent animate-pulse",
                index < activeIndex && "bg-emerald-400/70",
              )}
            />
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
