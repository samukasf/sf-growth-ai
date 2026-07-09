import { cn } from "@/utils/cn";

import { dsFieldClass } from "./shared";

type DsInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function DsInput({ label, hint, error, id, className, ...props }: DsInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="ds-root flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="ds-label">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(dsFieldClass, error && "border-[var(--ds-danger)] focus:ring-[var(--ds-danger)]/15", className)}
        {...props}
      />
      {error ? <p className="text-xs text-[var(--ds-danger)]">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-[var(--ds-text-muted)]">{hint}</p> : null}
    </div>
  );
}

export { DsInput as Input };
