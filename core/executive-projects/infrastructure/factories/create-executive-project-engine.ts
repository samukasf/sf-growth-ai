import type { ExecutiveProjectEngineDependencies } from "../../application";
import { ExecutiveProjectEngine } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import { InMemoryProjectRepository } from "../persistence/in-memory-project.repository";
import { DefaultApprovalWorkflow } from "../services/default-approval-workflow";
import { DefaultArchitectureGenerator } from "../services/default-architecture-generator";
import { DefaultBudgetEstimator } from "../services/default-budget-estimator";
import { DefaultExecutionPlanner } from "../services/default-execution-planner";
import { DefaultMilestoneGenerator } from "../services/default-milestone-generator";
import { DefaultProjectGenerator } from "../services/default-project-generator";
import { DefaultRequirementGenerator } from "../services/default-requirement-generator";
import { DefaultRiskEvaluator } from "../services/default-risk-evaluator";

export type CreateExecutiveProjectEngineOptions = {
  dependencies?: Partial<ExecutiveProjectEngineDependencies>;
};

export function createExecutiveProjectEngine(
  options: CreateExecutiveProjectEngineOptions = {},
): ExecutiveProjectEngine {
  const dependencies: ExecutiveProjectEngineDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryProjectRepository(),
    projectGenerator: options.dependencies?.projectGenerator ?? new DefaultProjectGenerator(),
    requirementGenerator:
      options.dependencies?.requirementGenerator ?? new DefaultRequirementGenerator(),
    architectureGenerator:
      options.dependencies?.architectureGenerator ?? new DefaultArchitectureGenerator(),
    milestoneGenerator:
      options.dependencies?.milestoneGenerator ?? new DefaultMilestoneGenerator(),
    budgetEstimator: options.dependencies?.budgetEstimator ?? new DefaultBudgetEstimator(),
    riskEvaluator: options.dependencies?.riskEvaluator ?? new DefaultRiskEvaluator(),
    executionPlanner: options.dependencies?.executionPlanner ?? new DefaultExecutionPlanner(),
    approvalWorkflow: options.dependencies?.approvalWorkflow ?? new DefaultApprovalWorkflow(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
  };

  return new ExecutiveProjectEngine(dependencies);
}
