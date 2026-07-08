import { Panel } from "./shared";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";

type AgencyOpportunityPanelProps = {
  data: AgencyWorkspaceData;
};

export function AgencyOpportunityPanel({ data }: AgencyOpportunityPanelProps) {
  return (
    <Panel
      title="Opportunities"
      subtitle={`${data.opportunities.length} oportunidades · Executive Opportunities`}
    >
      {data.opportunities.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma oportunidade detectada.</p>
      ) : (
        <ul className="space-y-3">
          {data.opportunities.map((result) => (
            <li
              key={result.opportunity.id}
              className="rounded-lg border border-white/[0.06] bg-black/20 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{result.opportunity.title}</p>
              <p className="mt-1 text-xs text-muted">{result.opportunity.description}</p>
              <div className="mt-3 flex gap-3 text-[11px] text-muted">
                <span>ROI: €{result.roi?.estimatedReturn ?? "—"}</span>
                <span>Prioridade: {result.priority?.level ?? "—"}</span>
                <span>{result.opportunity.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
