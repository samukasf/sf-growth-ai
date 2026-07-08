import { AgencyClientCard } from "./AgencyClientCard";
import { Panel } from "./shared";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";

type AgencyClientListProps = {
  data: AgencyWorkspaceData;
  selectedClientId: string | null;
  onSelectClient: (companyId: string) => void;
  onNewClient: () => void;
};

export function AgencyClientList({
  data,
  selectedClientId,
  onSelectClient,
  onNewClient,
}: AgencyClientListProps) {
  return (
    <Panel
      title="Client Portfolio"
      subtitle={`${data.clients.length} clientes na carteira`}
      action={
        <button
          type="button"
          onClick={onNewClient}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
        >
          Novo Cliente
        </button>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.clients.map((client) => (
          <li key={client.id}>
            <AgencyClientCard
              client={client}
              selected={selectedClientId === client.companyId}
              onSelect={() => onSelectClient(client.companyId)}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
