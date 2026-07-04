import { cn } from "@/utils/cn";
import type { CompanyMemoryRecord } from "@/services/executive-memory.service";

import { SectionHeader } from "../section-header";

type ExecutiveMemorySectionProps = {
  memories: CompanyMemoryRecord[];
};

type MemoryGroupProps = {
  title: string;
  entries: CompanyMemoryRecord[];
  accent?: "default" | "emerald" | "amber" | "accent";
};

const ACCENT_BORDER: Record<NonNullable<MemoryGroupProps["accent"]>, string> = {
  default: "border-border",
  emerald: "border-emerald-500/15",
  amber: "border-amber-500/15",
  accent: "border-accent/15",
};

const CATEGORY_ACCENTS: Record<string, MemoryGroupProps["accent"]> = {
  decisão: "amber",
  decisoes: "amber",
  recomendação: "accent",
  recomendacoes: "accent",
  resultado: "emerald",
  resultados: "emerald",
  aprendizado: "default",
  aprendizados: "default",
};

function formatContent(content: CompanyMemoryRecord["content"]) {
  if (typeof content === "string") return content;
  return JSON.stringify(content);
}

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
              {formatContent(entry.content)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
              <span>Importância: {entry.importance}</span>
              {entry.source ? <span>Fonte: {entry.source}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function groupMemoriesByCategory(memories: CompanyMemoryRecord[]) {
  return memories.reduce<Record<string, CompanyMemoryRecord[]>>((groups, memory) => {
    const category = memory.category?.trim() || "Geral";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(memory);
    return groups;
  }, {});
}

function getCategoryAccent(category: string): MemoryGroupProps["accent"] {
  const key = category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return CATEGORY_ACCENTS[key] ?? "default";
}

export function ExecutiveMemorySection({ memories }: ExecutiveMemorySectionProps) {
  const groupedMemories = groupMemoriesByCategory(memories);

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Memory"
        description="Memória estratégica de longo prazo"
      />

      {memories.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma memória registrada ainda.</p>
      ) : (
        Object.entries(groupedMemories).map(([category, entries]) => (
          <MemoryGroup
            key={category}
            title={category}
            entries={entries}
            accent={getCategoryAccent(category)}
          />
        ))
      )}
    </section>
  );
}
