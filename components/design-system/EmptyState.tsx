import { cn } from "@/utils/cn";

import { DsButton } from "./Button";

type DsEmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function DsEmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: DsEmptyStateProps) {
  return (
    <div className={cn("ds-root ds-empty", className)}>
      <div className="ds-empty-icon" aria-hidden="true">
        {icon ?? "—"}
      </div>
      <h3 className="ds-heading">{title}</h3>
      {description ? <p className="max-w-sm ds-body-sm ds-muted">{description}</p> : null}
      {actionLabel ? (
        <DsButton onClick={onAction} className="mt-2">
          {actionLabel}
        </DsButton>
      ) : null}
    </div>
  );
}

export { DsEmptyState as EmptyState };
