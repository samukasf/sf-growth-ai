import { APP_NAME } from "@/constants";
import { cn } from "@/utils/cn";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        aria-hidden="true"
        className="relative flex size-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
      >
        <span className="bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-lg font-semibold text-transparent">
          SF
        </span>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
      </div>
      <span className="sr-only">{APP_NAME}</span>
    </div>
  );
}
