import { ProjectDependency } from "../../domain";
import type { DependencyAnalyzer, DependencyAnalysisInput } from "../../domain";
import type { ProjectRiskLevel } from "../../shared";

export class DefaultDependencyAnalyzer implements DependencyAnalyzer {
  analyze(input: DependencyAnalysisInput): ProjectDependency[] {
    const { project } = input;
    const deps: ProjectDependency[] = [];

    const risk: ProjectRiskLevel = project.riskLevel;

    deps.push(
      ProjectDependency.create({
        projectId: project.id,
        name: "Stakeholder alignment",
        description: "Alinhamento executivo e aprovação de escopo.",
        type: "team",
        riskLevel: risk,
      }),
    );

    if (project.departments.includes("technology")) {
      deps.push(
        ProjectDependency.create({
          projectId: project.id,
          name: "System integrations",
          description: "Integrações com sistemas existentes e APIs.",
          type: "system",
          riskLevel: risk,
        }),
      );
    }

    return deps;
  }
}

