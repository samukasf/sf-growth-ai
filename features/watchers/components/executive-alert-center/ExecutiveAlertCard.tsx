import { cn } from "@/utils/cn";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";

import type {
  ConsolidatedExecutiveAlert,
  ExecutiveAlertSeverity,
  ExecutiveAlertStatus,
} from "./executive-alert-center.types";

type ExecutiveAlertCardProps = {
  alert: ConsolidatedExecutiveAlert;
  expanded?: boolean;
  onToggleDetails?: () => void;
  onDelegate?: () => void;
  onResolve?: () => void;
  onAddToAgenda?: () => void;
};

function severityVariant(severity: ExecutiveAlertSeverity) {
  switch (severity) {
    case "Critical":
      return "warning" as const;
    case "High":
      return "accent" as const;
    case "Medium":
      return "muted" as const;
    default:
      return "muted" as const;
  }
}

function statusLabel(status: ExecutiveAlertStatus): string {
  switch (status) {
    case "resolved":
      return "Resolvido";
    case "delegated":
      return "Delegado";
    case "agenda":
      return "Na Agenda";
    case "dismissed":
      return "Dispensado";
    default:
      return "Ativo";
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

export function ExecutiveAlertCard({
  alert,
  expanded = false,
  onToggleDetails,
  onDelegate,
  onResolve,
  onAddToAgenda,
}: ExecutiveAlertCardProps) {
  const isResolved = alert.status === "resolved";

  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2.5 transition-all duration-300",
        isResolved && "opacity-60",
        alert.severity === "Critical" && !isResolved && "border-rose-500/25 bg-rose-500/5",
        alert.severity === "High" && !isResolved && "border-amber-500/20 bg-amber-500/5",
        alert.severity === "Medium" && "border-border/60 bg-black/10",
        alert.severity === "Low" && "border-border/60 bg-black/10",
        expanded && "shadow-[0_0_20px_rgba(59,130,246,0.06)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{alert.title}</p>
          <p className="mt-0.5 text-[10px] text-accent">{alert.originLabel}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">{alert.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge label={alert.severity} variant={severityVariant(alert.severity)} />
          <StatusBadge
            label={statusLabel(alert.status)}
            variant={isResolved ? "success" : alert.status === "delegated" ? "accent" : "default"}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
        <span>{formatTimestamp(alert.timestamp)}</span>
        <span>Confiança: {alert.confidence}%</span>
        <span>Responsável: {alert.responsible}</span>
      </div>

      {expanded && (
        <div className="mt-2 space-y-1.5 border-t border-border/50 pt-2 text-[11px]">
          <p>
            <span className="text-muted">Impacto: </span>
            <span className="text-foreground/90">{alert.impact}</span>
          </p>
          <p>
            <span className="text-muted">Recomendação: </span>
            <span className="text-accent">{alert.recommendation}</span>
          </p>
        </div>
      )}

      {!isResolved && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <ActionButton label="Ver detalhes" onClick={onToggleDetails} active={expanded} />
          <ActionButton label="Delegar" onClick={onDelegate} />
          <ActionButton label="Marcar como resolvido" onClick={onResolve} />
          <ActionButton label="Adicionar à Agenda" onClick={onAddToAgenda} />
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
