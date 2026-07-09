import { cn } from "@/utils/cn";

type DsBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
};

const VARIANTS = {
  default: "bg-[var(--ds-surface-muted)] text-[var(--ds-text-muted)]",
  primary: "bg-[var(--ds-primary-soft)] text-[var(--ds-primary)]",
  success: "bg-[var(--ds-success-soft)] text-[var(--ds-success)]",
  warning: "bg-[var(--ds-warning-soft)] text-[var(--ds-warning)]",
  danger: "bg-[var(--ds-danger-soft)] text-[var(--ds-danger)]",
} as const;

export function DsBadge({ variant = "default", className, children, ...props }: DsBadgeProps) {
  return (
    <span
      className={cn(
        "ds-root inline-flex items-center rounded-[var(--ds-radius-full)] px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { DsBadge as Badge };
