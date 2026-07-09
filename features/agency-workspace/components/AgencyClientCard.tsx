import { cn } from "@/utils/cn";

import type { AgencyWorkspaceData, ClientLifecycleLabel } from "../types/agency-workspace.types";

type AgencyClientCardProps = {
  client: AgencyWorkspaceData["clients"][number];
  display?: AgencyWorkspaceData["clientDisplay"][string];
  selected?: boolean;
  onSelect?: () => void;
};

const LIFECYCLE_STYLES: Record<ClientLifecycleLabel, string> = {
  Saudável: "text-emerald-400",
  "Novo Cliente": "text-accent",
  "Em Onboarding": "text-amber-400",
};

export function AgencyClientCard({ client, display, selected, onSelect }: AgencyClientCardProps) {
  const segment = display?.segment ?? client.industry ?? "—";
  const city = display?.city ?? "—";
  const lifecycleLabel = display?.lifecycleLabel ?? "Novo Cliente";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full px-1 py-4 text-left transition-colors",
        selected && "bg-accent/5",
      )}
    >
      <p className="text-sm font-semibold text-foreground">{client.name}</p>
      <p className="mt-1 text-xs text-muted">{segment}</p>
      <p className="mt-0.5 text-xs text-muted">{city}</p>
      <p className={cn("mt-2 text-xs font-medium", LIFECYCLE_STYLES[lifecycleLabel])}>
        {lifecycleLabel}
      </p>
    </button>
  );
}
