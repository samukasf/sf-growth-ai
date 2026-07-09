import { cn } from "@/utils/cn";

type DsLoadingProps = {
  label?: string;
  className?: string;
  fullScreen?: boolean;
};

export function DsLoading({ label = "A carregar...", className, fullScreen = false }: DsLoadingProps) {
  return (
    <div
      className={cn(
        "ds-root ds-loading",
        fullScreen && "fixed inset-0 z-50 items-center justify-center bg-[var(--ds-background)]/80 backdrop-blur-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="ds-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export { DsLoading as Loading };
