import { Panel } from "./shared";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";

type AgencyMissionPanelProps = {
  data: AgencyWorkspaceData;
};

export function AgencyMissionPanel({ data }: AgencyMissionPanelProps) {
  return (
    <Panel title="Missions" subtitle={`${data.missions.length} missões · Executive Missions`}>
      <ul className="space-y-3">
        {data.missions.map((mission) => (
          <li
            key={mission.id}
            className="rounded-lg border border-white/[0.06] bg-black/20 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{mission.title}</p>
              <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                {mission.priority}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{mission.description}</p>
            <p className="mt-2 text-[11px] text-muted">
              Impacto: {mission.expectedImpact} · ROI: €{mission.estimatedROI}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
