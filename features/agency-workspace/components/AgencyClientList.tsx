"use client";

import { useMemo, useState } from "react";

import { cn } from "@/utils/cn";

import type { AgencyWorkspaceData } from "../types/agency-workspace.types";
import { AgencyClientCard } from "./AgencyClientCard";
import { Panel } from "./shared";

type AgencyClientListProps = {
  data: AgencyWorkspaceData;
  onSelectClient: (companyId: string) => void;
  onNewClient: () => void;
};

type ClientSortMode = "name" | "date-desc" | "date-asc";

function agencyShortName(name: string): string {
  return name.replace(/\s+Publicidade$/i, "").trim();
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function clientSearchText(
  client: AgencyWorkspaceData["clients"][number],
  display: AgencyWorkspaceData["clientDisplay"][string] | undefined,
): string {
  const segment = display?.segment ?? client.industry ?? "";
  const city = display?.city ?? "";
  const status = display?.lifecycleLabel ?? "";
  return normalizeSearch([client.name, segment, city, status].join(" "));
}

export function AgencyClientList({ data, onSelectClient, onNewClient }: AgencyClientListProps) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<ClientSortMode>("name");

  const visibleClients = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    const filtered = data.clients.filter((client) => {
      if (!normalizedQuery) return true;
      return clientSearchText(client, data.clientDisplay[client.companyId]).includes(normalizedQuery);
    });

    return [...filtered].sort((left, right) => {
      if (sortMode === "name") {
        return left.name.localeCompare(right.name, "pt");
      }

      const leftDate = new Date(left.createdAt).getTime();
      const rightDate = new Date(right.createdAt).getTime();
      return sortMode === "date-desc" ? rightDate - leftDate : leftDate - rightDate;
    });
  }, [data.clients, data.clientDisplay, query, sortMode]);

  return (
    <Panel
      title="Clientes"
      subtitle={agencyShortName(data.agencyName)}
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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[11px] text-muted">Pesquisar</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, segmento, cidade ou status..."
            className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/40"
          />
        </label>
        <label className="flex w-full flex-col gap-1 sm:w-48">
          <span className="text-[11px] text-muted">Ordenar por</span>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as ClientSortMode)}
            className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/40"
          >
            <option value="name">Nome</option>
            <option value="date-desc">Data (mais recente)</option>
            <option value="date-asc">Data (mais antiga)</option>
          </select>
        </label>
      </div>

      {visibleClients.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          {query ? "Nenhum cliente encontrado para esta pesquisa." : "Nenhum cliente cadastrado."}
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.08]">
          {visibleClients.map((client) => (
            <li key={client.id}>
              <AgencyClientCard
                client={client}
                display={data.clientDisplay[client.companyId]}
                onSelect={() => onSelectClient(client.companyId)}
              />
            </li>
          ))}
        </ul>
      )}

      <p className={cn("mt-4 text-[11px] text-muted")}>
        {visibleClients.length} de {data.clients.length} clientes
      </p>
    </Panel>
  );
}
