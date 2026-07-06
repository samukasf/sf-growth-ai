import {
  ProjectBudget,
  type BudgetEstimator,
  type ExecutiveProject,
} from "../../domain";

export class DefaultBudgetEstimator implements BudgetEstimator {
  estimate(project: ExecutiveProject): ProjectBudget {
    const developmentCost = Math.round(project.estimatedCost * 0.7);
    const infrastructureCost = Math.round(project.estimatedCost * 0.1);
    const maintenanceCost = Math.round(project.estimatedCost * 0.1);
    const contingency = Math.round(project.estimatedCost * 0.1);

    return ProjectBudget.create({
      companyId: project.companyId,
      projectId: project.id,
      developmentCost,
      infrastructureCost,
      maintenanceCost,
      contingency,
      currency: "BRL",
    });
  }
}
