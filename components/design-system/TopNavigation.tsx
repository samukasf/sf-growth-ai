import { cn } from "@/utils/cn";

type DsTopNavigationProps = {
  brand?: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function DsTopNavigation({
  brand,
  title,
  subtitle,
  actions,
  className,
}: DsTopNavigationProps) {
  return (
    <header
      className={cn(
        "ds-root flex h-[var(--ds-topbar-height)] shrink-0 items-center justify-between gap-4 border-b border-[var(--ds-border)] bg-[var(--ds-surface)] px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {brand}
        {(title || subtitle) && (
          <div className="min-w-0">
            {title ? <p className="truncate text-sm font-semibold text-[var(--ds-text)]">{title}</p> : null}
            {subtitle ? (
              <p className="truncate text-xs text-[var(--ds-text-muted)]">{subtitle}</p>
            ) : null}
          </div>
        )}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export { DsTopNavigation as TopNavigation };
