import { cn } from "@/utils/cn";

import type { ExecutiveInboxFilter } from "../executive-inbox.types";

type ExecutiveInboxFiltersProps = {
  activeFilter: ExecutiveInboxFilter;
  onFilterChange: (filter: ExecutiveInboxFilter) => void;
  counts: Partial<Record<ExecutiveInboxFilter, number>>;
};

const FILTERS: Array<{ id: ExecutiveInboxFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "today", label: "Hoje" },
  { id: "urgent", label: "Urgente" },
  { id: "this-week", label: "Esta Semana" },
  { id: "marketing", label: "Marketing" },
  { id: "finance", label: "Financeiro" },
  { id: "operations", label: "Operações" },
  { id: "sales", label: "Vendas" },
  { id: "hr", label: "RH" },
  { id: "legal", label: "Jurídico" },
  { id: "market", label: "Mercado" },
  { id: "seo", label: "SEO" },
  { id: "google", label: "Google" },
  { id: "meta", label: "Meta" },
  { id: "linkedin", label: "LinkedIn" },
];

export function ExecutiveInboxFilters({
  activeFilter,
  onFilterChange,
  counts,
}: ExecutiveInboxFiltersProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTERS.map((filter) => {
        const count = counts[filter.id];
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset transition-all duration-200",
              isActive
                ? "bg-accent/10 text-accent ring-accent/25"
                : "bg-white/[0.04] text-muted ring-white/[0.06] hover:text-foreground",
            )}
          >
            {filter.label}
            {typeof count === "number" && count > 0 && (
              <span className="ml-1 opacity-70">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
