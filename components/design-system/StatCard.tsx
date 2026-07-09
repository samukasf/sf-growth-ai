import { cn } from "@/utils/cn";

import { dsCardClass } from "./shared";

type DsStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
};

export function DsStatCard({ label, value, hint, className }: DsStatCardProps) {
  return (
    <div className={cn("ds-root p-5", dsCardClass, className)}>
      <p className="ds-caption">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ds-text)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--ds-text-muted)]">{hint}</p> : null}
    </div>
  );
}

export { DsStatCard as StatCard };
