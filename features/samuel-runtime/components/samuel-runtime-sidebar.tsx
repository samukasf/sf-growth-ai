"use client";

import { cn } from "@/utils/cn";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";

type SamuelRuntimeSidebarProps = {
  lastUpdated: string;
  companyBrainActive?: boolean;
  councilReady?: boolean;
  className?: string;
};

function formatUpdatedAt(iso: string) {
  const updated = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();

  if (diffMs < 60_000) return "Agora mesmo";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(updated);
}

function StatusRow({
  label,
  value,
  online = false,
}: {
  label: string;
  value: string;
  online?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {online && (
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
          />
        )}
        <span className="text-xs text-muted">{value}</span>
      </div>
    </div>
  );
}

export function SamuelRuntimeSidebar({
  lastUpdated,
  companyBrainActive = true,
  councilReady = true,
  className,
}: SamuelRuntimeSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-xl border border-border bg-card/80 p-5 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
          Status
        </p>
        <h2 className="mt-1 text-sm font-semibold text-foreground">Painel Samuel</h2>
      </div>

      <div className="flex flex-col">
        <StatusRow label="Samuel" value="Online" online />
        <StatusRow
          label="Company Brain"
          value={companyBrainActive ? "Ativo" : "Inativo"}
          online={companyBrainActive}
        />
        <StatusRow
          label="Executive Council"
          value={councilReady ? "Pronto" : "Convocando"}
          online={councilReady}
        />
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
          Última atualização
        </p>
        <p className="mt-1 text-sm text-foreground">{formatUpdatedAt(lastUpdated)}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge label="Runtime Alpha" variant="accent" />
        <StatusBadge label="Sem OpenAI" variant="muted" />
      </div>
    </aside>
  );
}
