import { cn } from "@/utils/cn";

import type { AgencyWorkspaceData, ClientLifecycleLabel } from "../types/agency-workspace.types";
import { Panel } from "./shared";

type AgencyClientDetailProps = {
  data: AgencyWorkspaceData;
  companyId: string;
  onBack: () => void;
};

const LIFECYCLE_STYLES: Record<ClientLifecycleLabel, string> = {
  Saudável: "text-emerald-400",
  "Novo Cliente": "text-accent",
  "Em Onboarding": "text-amber-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function AgencyClientDetail({ data, companyId, onBack }: AgencyClientDetailProps) {
  const client = data.clients.find((item) => item.companyId === companyId);
  const display = data.clientDisplay[companyId];
  const profile = data.clientProfiles[companyId];

  if (!client) {
    return (
      <Panel title="Cliente não encontrado" subtitle="Story 001.2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-accent hover:underline"
        >
          Voltar à lista
        </button>
      </Panel>
    );
  }

  const segment = display?.segment ?? client.industry ?? "—";
  const city = display?.city ?? profile?.city ?? "—";
  const lifecycleLabel = display?.lifecycleLabel ?? "Novo Cliente";

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="w-fit text-sm text-accent hover:underline"
      >
        ← Voltar à lista
      </button>

      <Panel title={client.name} subtitle="Detalhes do cliente · placeholder">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] text-muted">Nome da empresa</dt>
            <dd className="mt-1 text-sm text-foreground">{client.name}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Segmento</dt>
            <dd className="mt-1 text-sm text-foreground">{segment}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Cidade</dt>
            <dd className="mt-1 text-sm text-foreground">{city}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Status</dt>
            <dd className={cn("mt-1 text-sm font-medium", LIFECYCLE_STYLES[lifecycleLabel])}>
              {lifecycleLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Data de cadastro</dt>
            <dd className="mt-1 text-sm text-foreground">{formatDate(client.createdAt)}</dd>
          </div>
          {profile?.responsibleName ? (
            <div>
              <dt className="text-[11px] text-muted">Responsável</dt>
              <dd className="mt-1 text-sm text-foreground">{profile.responsibleName}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-6 rounded-lg border border-dashed border-white/[0.08] bg-black/20 px-4 py-6 text-center text-sm text-muted">
          Página de detalhes em construção. Conteúdo completo será adicionado em stories futuras.
        </p>
      </Panel>
    </div>
  );
}
