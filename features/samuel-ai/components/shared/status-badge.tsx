import { cn } from "@/utils/cn";

type StatusBadgeProps = {
  label: string;
  variant?: "default" | "success" | "warning" | "accent" | "muted";
  className?: string;
};

const VARIANT_STYLES: Record<NonNullable<StatusBadgeProps["variant"]>, string> = {
  default: "bg-white/[0.06] text-foreground ring-white/[0.08]",
  success: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  accent: "bg-accent/10 text-accent ring-accent/20",
  muted: "bg-white/[0.04] text-muted ring-white/[0.06]",
};

export function StatusBadge({
  label,
  variant = "default",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
