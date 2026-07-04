import type { ExecutiveContext as BrainExecutiveContext } from "../../executive-brain/types";
import type { ExecutiveContext as CompanyExecutiveContext } from "@/services/executive-context.service";
import { FieldList } from "../shared/field-list";
import { SectionHeader } from "../section-header";

type ExecutiveContextSectionProps = {
  context?: BrainExecutiveContext;
  executiveContext?: CompanyExecutiveContext | null;
};

function formatListValue(value: string | string[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? value.join(" · ") : value;
}

export function ExecutiveContextSection({
  context,
  executiveContext = null,
}: ExecutiveContextSectionProps) {
  const company = executiveContext?.company;
  const profile = executiveContext?.businessProfile;
  const segment = profile?.segment ?? company?.industry ?? context?.segment;
  const location =
    company && (company.city || company.country)
      ? [company.city, company.country].filter(Boolean).join(", ")
      : context?.location;
  const companyName = company?.name ?? context?.companyName ?? "—";
  const detectedObjective = context?.detectedObjective;
  const fields =
    context?.fields && context.fields.length > 0
      ? context.fields
      : [
          profile?.positioning
            ? {
                id: "profile-positioning",
                label: "Posicionamento",
                value: profile.positioning,
              }
            : null,
          formatListValue(profile?.differentiators)
            ? {
                id: "profile-differentiators",
                label: "Diferenciais",
                value: formatListValue(profile?.differentiators)!,
              }
            : null,
          formatListValue(profile?.objectives)
            ? {
                id: "profile-objectives",
                label: "Objetivos",
                value: formatListValue(profile?.objectives)!,
              }
            : null,
        ].filter(Boolean) as BrainExecutiveContext["fields"];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Context"
        description="Informações da empresa em análise"
      />

      <div className="rounded-xl border border-border bg-white/[0.02] p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Empresa ativa
        </p>
        <p className="mt-1 text-base font-semibold text-foreground">
          {companyName}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {segment ? <span>{segment}</span> : null}
          {location ? <span>{location}</span> : null}
        </div>
        {context ? (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-accent">
              {context.growthScore}
            </span>
            <span className="text-xs text-muted">Growth Score™</span>
          </div>
        ) : null}
      </div>

      {detectedObjective ? (
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Objetivo detectado
          </p>
          <p className="mt-1 text-sm text-foreground">{detectedObjective}</p>
        </div>
      ) : null}

      {fields.length > 0 ? <FieldList fields={fields} /> : null}

      {executiveContext?.summary ? (
        <div className="rounded-lg border border-border bg-white/[0.02] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Resumo executivo
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted">
            {executiveContext.summary}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
