import { cn } from "@/utils/cn";

import type { AgencyWorkspaceData } from "../types/agency-workspace.types";

type AgencyClientCardProps = {
  client: AgencyWorkspaceData["clients"][number];
  selected?: boolean;
  onSelect?: () => void;
};

export function AgencyClientCard({ client, selected, onSelect }: AgencyClientCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-accent/40 bg-accent/10"
          : "border-white/[0.06] bg-black/20 hover:border-white/[0.12]",
      )}
    >
      <p className="text-sm font-semibold text-foreground">{client.name}</p>
      <p className="mt-1 text-xs text-muted">{client.industry ?? "—"}</p>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
          {client.status}
        </span>
        <span className="text-muted">Company Brain ativo</span>
      </div>
    </button>
  );
}
