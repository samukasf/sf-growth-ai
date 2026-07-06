import type { ExecutiveProject, ProjectBudget } from "../entities";

export interface BudgetEstimator {
  estimate(project: ExecutiveProject): ProjectBudget;
}
