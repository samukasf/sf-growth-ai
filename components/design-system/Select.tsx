import { cn } from "@/utils/cn";

import { dsFieldClass } from "./shared";

type DsSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function DsSelect({ label, hint, error, id, className, children, ...props }: DsSelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="ds-root flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={selectId} className="ds-label">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={cn(dsFieldClass, error && "border-[var(--ds-danger)] focus:ring-[var(--ds-danger)]/15", className)}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-[var(--ds-danger)]">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-[var(--ds-text-muted)]">{hint}</p> : null}
    </div>
  );
}

export { DsSelect as Select };
