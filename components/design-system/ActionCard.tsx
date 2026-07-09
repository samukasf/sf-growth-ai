import { cn } from "@/utils/cn";

import { dsCardClass } from "./shared";
import { DsButton } from "./Button";

type DsActionCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  href?: string;
  className?: string;
};

export function DsActionCard({
  title,
  description,
  actionLabel,
  onAction,
  href,
  className,
}: DsActionCardProps) {
  return (
    <div className={cn("ds-root flex flex-col gap-4 p-6", dsCardClass, className)}>
      <div className="space-y-2">
        <h3 className="ds-heading">{title}</h3>
        <p className="ds-body-sm ds-muted">{description}</p>
      </div>
      {href ? (
        <a href={href} className="w-fit">
          <DsButton>{actionLabel}</DsButton>
        </a>
      ) : (
        <DsButton onClick={onAction} className="w-fit">
          {actionLabel}
        </DsButton>
      )}
    </div>
  );
}

export { DsActionCard as ActionCard };
