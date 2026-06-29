import { cn } from "@/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        fullWidth && "w-full",
        variant === "primary" &&
          "bg-accent text-white shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-accent-hover active:scale-[0.99]",
        variant === "secondary" &&
          "border border-border bg-white/[0.04] text-foreground hover:bg-white/[0.08] active:scale-[0.99]",
        variant === "ghost" &&
          "text-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
