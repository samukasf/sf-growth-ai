import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type InspectorSectionProps = {
  title: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Seção colapsável reutilizável do Samuel Playground. Usa `<details>` nativo
 * (sem estado React) para manter o painel de inspeção simples — cada
 * chamada renderiza uma seção independente do pipeline (Intent, Contexto,
 * Memórias, Company Brain, Executive Council, AI Gateway, Resposta final).
 */
export function InspectorSection({
  title,
  badge,
  defaultOpen = true,
  children,
  className,
}: InspectorSectionProps) {
  return (
    <details
      open={defaultOpen}
      className={cn("group rounded-lg border border-border bg-white/[0.02]", className)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 select-none">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge}
          <span className="text-xs text-muted transition-transform duration-150 group-open:rotate-90">
            ›
          </span>
        </div>
      </summary>
      <div className="border-t border-border px-4 py-3">{children}</div>
    </details>
  );
}
