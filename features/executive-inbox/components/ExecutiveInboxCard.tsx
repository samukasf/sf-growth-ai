import { cn } from "@/utils/cn";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";

import { getInboxTypeLabel } from "../services/executive-inbox.service";
import type { ExecutiveInboxItem, InboxPriority, InboxStatus } from "../executive-inbox.types";

type ExecutiveInboxCardProps = {
  item: ExecutiveInboxItem;
  expanded?: boolean;
  onOpen?: () => void;
  onDelegate?: () => void;
  onResolve?: () => void;
  onArchive?: () => void;
  onExecute?: () => void;
};

function priorityVariant(priority: InboxPriority) {
  switch (priority) {
    case "Critical":
      return "warning" as const;
    case "High":
      return "accent" as const;
    default:
      return "muted" as const;
  }
}

function statusLabel(status: InboxStatus): string {
  switch (status) {
    case "resolved":
      return "Resolvido";
    case "archived":
      return "Arquivado";
    case "delegated":
      return "Delegado";
    case "executing":
      return "Executando";
    case "urgent":
      return "Urgente";
    default:
      return "Pendente";
  }
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ExecutiveInboxCard({
  item,
  expanded = false,
  onOpen,
  onDelegate,
  onResolve,
  onArchive,
  onExecute,
}: ExecutiveInboxCardProps) {
  const isClosed = item.status === "resolved" || item.status === "archived";

  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2.5 transition-all duration-300",
        isClosed && "opacity-60",
        item.priority === "Critical" && !isClosed && "border-rose-500/25 bg-rose-500/5",
        item.priority === "High" && !isClosed && "border-amber-500/20 bg-amber-500/5",
        item.priority === "Medium" && "border-border/60 bg-black/10",
        item.priority === "Low" && "border-border/60 bg-black/10",
        expanded && "shadow-[0_0_20px_rgba(59,130,246,0.06)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{item.title}</p>
          <p className="mt-0.5 text-[10px] text-accent">
            {item.origin} · {getInboxTypeLabel(item.type)}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">{item.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge label={item.priority} variant={priorityVariant(item.priority)} />
          <StatusBadge
            label={statusLabel(item.status)}
            variant={
              isClosed
                ? "success"
                : item.status === "delegated" || item.status === "executing"
                  ? "accent"
                  : item.status === "urgent"
                    ? "warning"
                    : "default"
            }
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
        <span>{formatTimestamp(item.date)}</span>
        <span>Confiança: {item.confidence}%</span>
        <span>Área: {item.area}</span>
      </div>

      {expanded && (
        <div className="mt-2 space-y-1.5 border-t border-border/50 pt-2 text-[11px]">
          <p>
            <span className="text-muted">Impacto: </span>
            <span className="text-foreground/90">{item.impact}</span>
          </p>
        </div>
      )}

      {!isClosed && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <ActionButton label="Abrir" onClick={onOpen} active={expanded} />
          <ActionButton label="Delegar" onClick={onDelegate} />
          <ActionButton label="Resolver" onClick={onResolve} />
          <ActionButton label="Arquivar" onClick={onArchive} />
          <ActionButton label="Executar" onClick={onExecute} />
        </div>
      )}
    </li>
  );
}

function ActionButton({
  label,
  onClick,
  active = false,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-2 py-1 text-[10px] font-medium transition-colors duration-200",
        active
          ? "bg-accent/15 text-accent"
          : "bg-white/[0.05] text-muted hover:bg-white/[0.08] hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
