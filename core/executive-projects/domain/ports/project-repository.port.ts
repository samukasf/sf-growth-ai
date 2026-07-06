import type { CompanyId, ExecutiveProjectId } from "../../shared";
import type {
  ExecutiveProject,
  ProjectApproval,
  ProjectArchitecture,
  ProjectBudget,
  ProjectExecutionPlan,
  ProjectMilestone,
  ProjectRequirement,
  ProjectRisk,
  ProjectROI,
  ProjectScope,
} from "../entities";

export type ProjectQuery = {
  companyId: CompanyId;
  projectType?: string;
  status?: string;
  minPriority?: number;
  limit?: number;
};

export interface ProjectRepository {
  saveProject(project: ExecutiveProject): Promise<void>;
  findProjectById(id: ExecutiveProjectId): Promise<ExecutiveProject | null>;
  findProjectsByCompany(companyId: CompanyId): Promise<ExecutiveProject[]>;
  queryProjects(filters: ProjectQuery): Promise<ExecutiveProject[]>;
  deleteProject(id: ExecutiveProjectId): Promise<void>;
  saveRequirements(requirements: ProjectRequirement[]): Promise<void>;
  saveArchitecture(architecture: ProjectArchitecture): Promise<void>;
  saveScope(scope: ProjectScope): Promise<void>;
  saveMilestones(milestones: ProjectMilestone[]): Promise<void>;
  saveBudget(budget: ProjectBudget): Promise<void>;
  saveRisks(risks: ProjectRisk[]): Promise<void>;
  saveROI(roi: ProjectROI): Promise<void>;
  saveApproval(approval: ProjectApproval): Promise<void>;
  saveExecutionPlan(plan: ProjectExecutionPlan): Promise<void>;
  findApprovals(companyId: CompanyId): Promise<ProjectApproval[]>;
}
