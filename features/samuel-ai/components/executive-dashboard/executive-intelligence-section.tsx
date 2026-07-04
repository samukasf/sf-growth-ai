import { cn } from "@/utils/cn";

import type { ExecutiveIntelligence } from "../../services/executive-intelligence.service";
import { SectionHeader } from "../section-header";

type ExecutiveIntelligenceSectionProps = {
  intelligence: ExecutiveIntelligence | null;
};

type IntelligenceGroupProps = {
  title: string;
  items: string[];
  accent?: "emerald" | "amber" | "accent" | "rose" | "default";
};

const ACCENT_STYLES: Record<
  NonNullable<IntelligenceGroupProps["accent"]>,
  { border: string; badge: string; item: string }
> = {
  emerald: {
    border: "border-emerald-500/15",
    badge: "text-emerald-400",
    item: "border-emerald-500/15 bg-emerald-500/[0.03] text-emerald-300/90",
  },
  amber: {
    border: "border-amber-500/15",
    badge: "text-amber-400",
    item: "border-amber-500/15 bg-amber-500/[0.03] text-amber-300/90",
  },
  accent: {
    border: "border-accent/15",
    badge: "text-accent",
    item: "border-accent/15 bg-accent/[0.03] text-accent/90",
  },
  rose: {
    border: "border-rose-500/15",
    badge: "text-rose-400",
    item: "border-rose-500/15 bg-rose-500/[0.03] text-rose-300/90",
  },
  default: {
    border: "border-border",
    badge: "text-muted",
    item: "border-border bg-white/[0.02] text-muted",
  },
};

function IntelligenceGroup({
  title,
  items,
  accent = "default",
}: IntelligenceGroupProps) {
  if (items.length === 0) return null;

  const styles = ACCENT_STYLES[accent];

  return (
    <div>
      <p
        className={cn(
          "mb-2 text-[10px] font-medium uppercase tracking-wider",
          styles.badge,
        )}
      >
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs leading-relaxed",
              styles.item,
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExecutiveIntelligenceSection({
  intelligence,
}: ExecutiveIntelligenceSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Intelligence"
        description="Interpretação estratégica do contexto da empresa"
      />

      {!intelligence ? (
        <p className="text-sm text-muted">
          Inteligência executiva indisponível — contexto da empresa não carregado.
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
              Resumo Executivo
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {intelligence.executiveSummary}
            </p>
          </div>

          <IntelligenceGroup
            title="Forças"
            items={intelligence.strengths}
            accent="emerald"
          />
          <IntelligenceGroup
            title="Fraquezas"
            items={intelligence.weaknesses}
            accent="amber"
          />
          <IntelligenceGroup
            title="Oportunidades"
            items={intelligence.opportunities}
            accent="accent"
          />
          <IntelligenceGroup
            title="Riscos"
            items={intelligence.risks}
            accent="rose"
          />
          <IntelligenceGroup
            title="Prioridades"
            items={intelligence.priorities}
            accent="default"
          />
        </>
      )}
    </section>
  );
}
