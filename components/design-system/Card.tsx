import { cn } from "@/utils/cn";

import { dsCardClass } from "./shared";

type DsCardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md" | "lg";
};

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
} as const;

export function DsCard({ padding = "md", className, children, ...props }: DsCardProps) {
  return (
    <div className={cn("ds-root", dsCardClass, PADDING[padding], className)} {...props}>
      {children}
    </div>
  );
}

export { DsCard as Card };
