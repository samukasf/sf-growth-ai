import { Panel } from "./shared";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";

type AgencyProjectPanelProps = {
  data: AgencyWorkspaceData;
};

export function AgencyProjectPanel({ data }: AgencyProjectPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Executive Projects"
        subtitle={`${data.projects.length} projetos · Executive Projects`}
      >
        <ul className="space-y-3">
          {data.projects.map((project) => (
            <li
              key={project.id}
              className="rounded-lg border border-white/[0.06] bg-black/20 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{project.title}</p>
              <p className="mt-1 text-xs text-muted">{project.description}</p>
              <p className="mt-2 text-[11px] text-muted">
                {project.status} · ROI €{project.estimatedROI}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Software Factory"
        subtitle={`${data.softwareProjects.length} projetos de software`}
      >
        <ul className="space-y-3">
          {data.softwareProjects.map((result) => (
            <li
              key={result.project.id}
              className="rounded-lg border border-white/[0.06] bg-black/20 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{result.project.title}</p>
              <p className="mt-1 text-xs text-muted">{result.project.description}</p>
              <p className="mt-2 text-[11px] text-muted">{result.project.approvalStatus}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
