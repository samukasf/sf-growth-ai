import type { ExecutiveProject, ProjectRisk } from "../entities";

export interface RiskEvaluator {
  evaluate(project: ExecutiveProject): ProjectRisk[];
}
