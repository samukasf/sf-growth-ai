import { cn } from "@/utils/cn";

import type { ExecutiveAlertFilter } from "./executive-alert-center.types";

type ExecutiveAlertFiltersProps = {
  activeFilter: ExecutiveAlertFilter;
  onFilterChange: (filter: ExecutiveAlertFilter) => void;
  counts: Partial<Record<ExecutiveAlertFilter, number>>;
};

const FILTERS: Array<{ id: ExecutiveAlertFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "critical", label: "Críticos" },
  { id: "today", label: "Hoje" },
  { id: "this-week", label: "Esta Semana" },
  { id: "marketing", label: "Marketing" },
  { id: "finance", label: "Financeiro" },
  { id: "operations", label: "Operações" },
  { id: "seo", label: "SEO" },
  { id: "market", label: "Mercado" },
];

export function ExecutiveAlertFilters({
  activeFilter,
  onFilterChange,
  counts,
}: ExecutiveAlertFiltersProps) {
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
