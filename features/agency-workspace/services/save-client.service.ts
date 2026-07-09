import { AgencyClient } from "@/core/agency-core";

import type { AgencyWorkspaceData } from "../types/agency-workspace.types";
import type { NewClientFormInput, SaveClientContext, SaveClientResult } from "../types/new-client.types";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildCompanyId(name: string): string {
  return `company-${slugify(name)}-${Date.now().toString(36)}`;
}

export function saveNewClient(
  input: NewClientFormInput,
  context: SaveClientContext,
): SaveClientResult {
  if (!input.companyName.trim()) {
    throw new Error("Nome da empresa é obrigatório.");
  }
  if (!input.responsibleName.trim()) {
    throw new Error("Nome do responsável é obrigatório.");
  }

  const companyId = buildCompanyId(input.companyName);

  const client = AgencyClient.create({
    organizationId: context.organizationId,
    agencyId: context.agencyId,
    companyId,
    name: input.companyName.trim(),
    industry: input.segment.trim() || undefined,
  });

  return {
    companyId,
    client: client.toJSON(),
    profile: input,
  };
}

export function mergeClientIntoWorkspace(
  data: AgencyWorkspaceData,
  result: SaveClientResult,
): AgencyWorkspaceData {
  const clients = data.clients.some((client) => client.companyId === result.companyId)
    ? data.clients.map((client) =>
        client.companyId === result.companyId ? result.client : client,
      )
    : [...data.clients, result.client];

  const agencyDashboard = data.agencyDashboard
    ? {
        ...data.agencyDashboard,
        sections: data.agencyDashboard.sections.map((section) => {
          if (section.key !== "clients") return section;
          return {
            ...section,
            metrics: {
              ...section.metrics,
              total: clients.length,
              active: clients.filter((client) => client.status === "active").length,
            },
          };
        }),
      }
    : data.agencyDashboard;

  return {
    ...data,
    clients,
    selectedClientId: result.companyId,
    agencyDashboard,
    clientProfiles: {
      ...data.clientProfiles,
      [result.companyId]: result.profile,
    },
    clientDisplay: {
      ...data.clientDisplay,
      [result.companyId]: {
        segment: result.profile.segment.trim() || result.client.industry || "—",
        city: result.profile.city.trim() || "—",
        lifecycleLabel: "Novo Cliente",
      },
    },
  };
}
