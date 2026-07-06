export type {
  CompanyId,
  DomainEventId,
  ExecutiveProjectId,
  ProjectApprovalId,
  ProjectArchitectureId,
  ProjectBudgetId,
  ProjectExecutionPlanId,
  ProjectMilestoneId,
  ProjectRequirementId,
  ProjectROIId,
  ProjectRiskId,
  ProjectScopeId,
} from "./identifiers";

export { clampScore, MAX_SCORE, MIN_SCORE, type Score } from "./scores";

export { err, ok, type Result } from "./result";
