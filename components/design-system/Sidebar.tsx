import { cn } from "@/utils/cn";

export type DsSidebarItem = {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
};

type DsSidebarProps = {
  title?: string;
  subtitle?: string;
  items: DsSidebarItem[];
  footer?: React.ReactNode;
  className?: string;
};

export function DsSidebar({
  title,
  subtitle,
  items,
  footer,
  className,
}: DsSidebarProps) {
  return (
    <aside
      className={cn(
        "ds-root flex h-full w-[var(--ds-sidebar-width)] shrink-0 flex-col border-r border-[var(--ds-border)] bg-[var(--ds-surface)]",
        className,
      )}
    >
      {(title || subtitle) && (
        <div className="border-b border-[var(--ds-border)] px-4 py-5">
          {title ? <p className="text-sm font-semibold text-[var(--ds-text)]">{title}</p> : null}
          {subtitle ? <p className="mt-1 text-xs text-[var(--ds-text-muted)]">{subtitle}</p> : null}
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const classNames = cn(
            "flex items-center gap-2.5 rounded-[var(--ds-radius-md)] px-3 py-2 text-sm transition-colors",
            item.active
              ? "bg-[var(--ds-primary-soft)] font-medium text-[var(--ds-primary)]"
              : "text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)] hover:text-[var(--ds-text)]",
            item.disabled && "pointer-events-none opacity-40",
          );

          const content = (
            <>
              {item.icon ? (
                <span className="flex size-5 shrink-0 items-center justify-center">{item.icon}</span>
              ) : null}
              <span>{item.label}</span>
            </>
          );

          if (item.disabled) {
            return (
              <span key={item.id} className={classNames} title="Em breve">
                {content}
              </span>
            );
          }

          if (item.href) {
            return (
              <a key={item.id} href={item.href} className={classNames}>
                {content}
              </a>
            );
          }

          return (
            <span key={item.id} className={classNames}>
              {content}
            </span>
          );
        })}
      </nav>

      {footer ? <div className="border-t border-[var(--ds-border)] p-4">{footer}</div> : null}
    </aside>
  );
}

export { DsSidebar as Sidebar };
