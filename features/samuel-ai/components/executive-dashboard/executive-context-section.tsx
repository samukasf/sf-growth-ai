import type { ExecutiveContext } from "../../executive-brain/types";
import { FieldList } from "../shared/field-list";
import { SectionHeader } from "../section-header";

type ExecutiveContextSectionProps = {
  context: ExecutiveContext;
};

export function ExecutiveContextSection({ context }: ExecutiveContextSectionProps) {
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
          {context.companyName}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>{context.segment}</span>
          <span>{context.location}</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-accent">
            {context.growthScore}
          </span>
          <span className="text-xs text-muted">Growth Score™</span>
        </div>
      </div>

      <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
          Objetivo detectado
        </p>
        <p className="mt-1 text-sm text-foreground">{context.detectedObjective}</p>
      </div>

      <FieldList fields={context.fields} />
    </section>
  );
}
