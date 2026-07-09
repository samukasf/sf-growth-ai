import { cn } from "@/utils/cn";

type DsAvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DsAvatar({ name, src, size = "md", className }: DsAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "ds-root rounded-[var(--ds-radius-full)] object-cover ring-2 ring-[var(--ds-surface)]",
          SIZES[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={cn(
        "ds-root inline-flex items-center justify-center rounded-[var(--ds-radius-full)] bg-[var(--ds-primary-soft)] font-semibold text-[var(--ds-primary)]",
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export { DsAvatar as Avatar };
