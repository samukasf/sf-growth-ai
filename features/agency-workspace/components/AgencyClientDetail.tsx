import { cn } from "@/utils/cn";

import type { AgencyWorkspaceData } from "../types/agency-workspace.types";
import type { NewClientFormInput } from "../types/new-client.types";
import { Panel } from "./shared";

type AgencyClientDetailProps = {
  data: AgencyWorkspaceData;
  companyId: string;
  onBack: () => void;
};

type DetailField = {
  label: string;
  value: string;
  href?: string;
  fullWidth?: boolean;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayValue(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function externalHref(value: string, prefix?: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (prefix) return `${prefix}${trimmed.replace(/^@/, "")}`;
  return `https://${trimmed}`;
}

function buildDetailFields(
  client: AgencyWorkspaceData["clients"][number],
  profile: NewClientFormInput | undefined,
  display: AgencyWorkspaceData["clientDisplay"][string] | undefined,
): DetailField[] {
  const segment = profile?.segment || display?.segment || client.industry;
  const city = profile?.city || display?.city;

  return [
    { label: "Nome da empresa", value: displayValue(client.name) },
    { label: "Responsável", value: displayValue(profile?.responsibleName) },
    {
      label: "Email",
      value: displayValue(profile?.email),
      href: profile?.email?.trim() ? `mailto:${profile.email.trim()}` : undefined,
    },
    {
      label: "Telefone",
      value: displayValue(profile?.phone),
      href: profile?.phone?.trim() ? `tel:${profile.phone.trim()}` : undefined,
    },
    {
      label: "Website",
      value: displayValue(profile?.website),
      href: profile?.website ? externalHref(profile.website) : undefined,
    },
    {
      label: "Instagram",
      value: displayValue(profile?.instagram),
      href: profile?.instagram ? externalHref(profile.instagram, "https://instagram.com/") : undefined,
    },
    {
      label: "Facebook",
      value: displayValue(profile?.facebook),
      href: profile?.facebook ? externalHref(profile.facebook, "https://facebook.com/") : undefined,
    },
    {
      label: "Google Business",
      value: displayValue(profile?.googleBusiness),
      href: profile?.googleBusiness ? externalHref(profile.googleBusiness) : undefined,
    },
    { label: "Cidade", value: displayValue(city) },
    { label: "País", value: displayValue(profile?.country) },
    { label: "Segmento", value: displayValue(segment) },
    { label: "Número de funcionários", value: displayValue(profile?.employeeCount) },
    { label: "Objetivo principal", value: displayValue(profile?.mainObjective), fullWidth: true },
    { label: "Observações", value: displayValue(profile?.notes), fullWidth: true },
    { label: "Data de criação", value: formatDateTime(client.createdAt) },
    { label: "Última atualização", value: formatDateTime(client.updatedAt) },
  ];
}

function DetailValue({ field }: { field: DetailField }) {
  if (field.href && field.value !== "—") {
    return (
      <dd className="mt-1">
        <a
          href={field.href}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-accent hover:underline"
        >
          {field.value}
        </a>
      </dd>
    );
  }

  return (
    <dd className={cn("mt-1 text-sm text-foreground", field.fullWidth && "whitespace-pre-wrap")}>
      {field.value}
    </dd>
  );
}

export function AgencyClientDetail({ data, companyId, onBack }: AgencyClientDetailProps) {
  const client = data.clients.find((item) => item.companyId === companyId);
  const display = data.clientDisplay[companyId];
  const profile = data.clientProfiles[companyId];

  if (!client) {
    return (
      <Panel title="Cliente não encontrado" subtitle="Story 001.3">
        <button type="button" onClick={onBack} className="text-sm text-accent hover:underline">
          Voltar à lista
        </button>
      </Panel>
    );
  }

  const fields = buildDetailFields(client, profile, display);

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="w-fit text-sm text-accent hover:underline">
        ← Voltar à lista
      </button>

      <Panel title={client.name} subtitle="Detalhes do cliente · Story 001.3">
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className={cn(field.fullWidth && "sm:col-span-2")}>
              <dt className="text-[11px] text-muted">{field.label}</dt>
              <DetailValue field={field} />
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-white/[0.06] pt-6">
          <button
            type="button"
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-foreground hover:border-white/[0.16]"
          >
            Editar Cliente
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 hover:border-red-500/40"
          >
            Excluir Cliente
          </button>
          <button
            type="button"
            disabled
            title="Disponível em stories futuras"
            className="rounded-lg border border-white/[0.06] px-4 py-2 text-sm text-muted opacity-50"
          >
            Ativar Supercérebro
          </button>
        </div>
      </Panel>
    </div>
  );
}
