import { cn } from "@/utils/cn";

export const dsFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-primary)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-surface)]";

export const dsFieldClass = cn(
  "h-10 w-full rounded-[var(--ds-radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3",
  "text-sm text-[var(--ds-text)] placeholder:text-[var(--ds-text-subtle)]",
  "transition-[border-color,box-shadow] duration-150",
  "hover:border-[var(--ds-border-strong)]",
  "focus:border-[var(--ds-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-primary)]/15",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export const dsCardClass =
  "rounded-[var(--ds-radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)] shadow-[var(--ds-shadow-sm)]";
