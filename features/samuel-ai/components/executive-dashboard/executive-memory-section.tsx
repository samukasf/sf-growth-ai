import { cn } from "@/utils/cn";

import type { ExecutiveMemory, StrategicMemoryEntry } from "../../executive-brain/types";
import { SectionHeader } from "../section-header";

type ExecutiveMemorySectionProps = {
  memory: ExecutiveMemory;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

type MemoryGroupProps = {
  title: string;
  entries: StrategicMemoryEntry[];
  accent?: "default" | "emerald" | "amber" | "accent";
};

const ACCENT_BORDER: Record<NonNullable<MemoryGroupProps["accent"]>, string> = {
  default: "border-border",
  emerald: "border-emerald-500/15",
  amber: "border-amber-500/15",
  accent: "border-accent/15",
};

function MemoryGroup({ title, entries, accent = "default" }: MemoryGroupProps) {
  if (entries.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={cn(
              "rounded-lg border bg-white/[0.02] px-3 py-2.5",
              ACCENT_BORDER[accent],
            )}
          >
            <p className="text-sm font-medium text-foreground">{entry.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {entry.summary}
            </p>
            {entry.outcome && (
              <p className="mt-1.5 text-xs text-emerald-400/90">
                Resultado: {entry.outcome}
              </p>
            )}
            <p className="mt-2 text-[11px] text-muted">{formatDate(entry.date)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExecutiveMemorySection({ memory }: ExecutiveMemorySectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Memory"
        description="Memória estratégica de longo prazo"
      />

      <MemoryGroup
        title="Decisões recentes"
        entries={memory.recentDecisions}
        accent="amber"
      />
      <MemoryGroup
        title="Recomendações anteriores"
        entries={memory.previousRecommendations}
        accent="accent"
      />
      <MemoryGroup
        title="Resultados obtidos"
        entries={memory.results}
        accent="emerald"
      />
      <MemoryGroup title="Aprendizados" entries={memory.learnings} />

      {memory.relevantPatterns.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
            Padrões estratégicos
          </p>
          <ul className="flex flex-col gap-1.5">
            {memory.relevantPatterns.map((pattern) => (
              <li
                key={pattern}
                className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2 text-xs leading-relaxed text-emerald-300/90"
              >
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
