import { cn } from "@/utils/cn";

import { dsFieldClass } from "./shared";

type DsTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function DsTextarea({ label, hint, error, id, className, ...props }: DsTextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="ds-root flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={textareaId} className="ds-label">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={cn(
          dsFieldClass,
          "h-auto min-h-[6rem] py-2.5",
          error && "border-[var(--ds-danger)] focus:ring-[var(--ds-danger)]/15",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-[var(--ds-danger)]">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-[var(--ds-text-muted)]">{hint}</p> : null}
    </div>
  );
}

export { DsTextarea as Textarea };
