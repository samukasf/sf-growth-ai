import { cn } from "@/utils/cn";

import { dsFocusRing } from "./shared";

type DsButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

const VARIANTS = {
  primary:
    "bg-[var(--ds-primary)] text-[var(--ds-text-inverse)] hover:bg-[var(--ds-primary-hover)] shadow-[var(--ds-shadow-xs)]",
  secondary:
    "border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text)] hover:bg-[var(--ds-surface-muted)]",
  ghost: "text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-muted)] hover:text-[var(--ds-text)]",
  danger:
    "bg-[var(--ds-danger)] text-[var(--ds-text-inverse)] hover:bg-[#b91c1c] shadow-[var(--ds-shadow-xs)]",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;

export function DsButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: DsButtonProps) {
  return (
    <button
      className={cn(
        "ds-root inline-flex items-center justify-center gap-2 rounded-[var(--ds-radius-md)] font-medium transition-all duration-150",
        "disabled:pointer-events-none disabled:opacity-50",
        dsFocusRing,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { DsButton as Button };
