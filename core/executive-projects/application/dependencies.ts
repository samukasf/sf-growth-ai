import type { EventDispatcher } from "../shared";
import type {
  ApprovalWorkflow,
  ArchitectureGenerator,
  BudgetEstimator,
  ExecutionPlanner,
  MilestoneGenerator,
  ProjectGenerator,
  ProjectRepository,
  RequirementGenerator,
  RiskEvaluator,
} from "../domain";

export type ExecutiveProjectEngineDependencies = {
  repository: ProjectRepository;
  projectGenerator: ProjectGenerator;
  requirementGenerator: RequirementGenerator;
  architectureGenerator: ArchitectureGenerator;
  milestoneGenerator: MilestoneGenerator;
  budgetEstimator: BudgetEstimator;
  riskEvaluator: RiskEvaluator;
  executionPlanner: ExecutionPlanner;
  approvalWorkflow: ApprovalWorkflow;
  eventDispatcher: EventDispatcher;
};
