import { cn } from "@/utils/cn";

type CommandPanelProps = {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
};

export function CommandPanel({
  children,
  className,
  accent = false,
}: CommandPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/80 backdrop-blur-xl",
        accent
          ? "border-accent/20 shadow-[0_0_40px_rgba(59,130,246,0.06)]"
          : "border-border shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
