import { cn } from "@/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-zinc-300"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-lg border border-border bg-white/[0.04] px-3.5 text-sm text-foreground",
          "placeholder:text-zinc-500",
          "transition-colors duration-200",
          "hover:border-white/[0.14] hover:bg-white/[0.06]",
          "focus:border-accent/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-accent/20",
          className,
        )}
        {...props}
      />
    </div>
  );
}
