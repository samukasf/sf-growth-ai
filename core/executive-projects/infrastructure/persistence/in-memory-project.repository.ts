import {
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
  type ProjectQuery,
  type ProjectRepository,
} from "../../domain";

function serializeProject(project: ExecutiveProject): string {
  return JSON.stringify(project.toJSON());
}

function deserializeProject(raw: string): ExecutiveProject {
  const parsed = JSON.parse(raw) as ReturnType<ExecutiveProject["toJSON"]>;
  return ExecutiveProject.create(parsed);
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly projects = new Map<string, string>();
  private readonly requirements: ProjectRequirement[] = [];
  private readonly architectures: ProjectArchitecture[] = [];
  private readonly scopes: ProjectScope[] = [];
  private readonly milestones: ProjectMilestone[] = [];
  private readonly budgets: ProjectBudget[] = [];
  private readonly risks: ProjectRisk[] = [];
  private readonly rois: ProjectROI[] = [];
  private readonly approvals: ProjectApproval[] = [];
  private readonly executionPlans: ProjectExecutionPlan[] = [];

  async saveProject(project: ExecutiveProject): Promise<void> {
    this.projects.set(project.id, serializeProject(project));
  }

  async findProjectById(id: string): Promise<ExecutiveProject | null> {
    const raw = this.projects.get(id);
    return raw ? deserializeProject(raw) : null;
  }

  async findProjectsByCompany(companyId: string): Promise<ExecutiveProject[]> {
    const results: ExecutiveProject[] = [];

    for (const raw of this.projects.values()) {
      const project = deserializeProject(raw);
      if (project.companyId === companyId) results.push(project);
    }

    return results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async queryProjects(filters: ProjectQuery): Promise<ExecutiveProject[]> {
    let results = await this.findProjectsByCompany(filters.companyId);

    if (filters.projectType) {
      results = results.filter((item) => item.projectType === filters.projectType);
    }
    if (filters.status) {
      results = results.filter((item) => item.status === filters.status);
    }
    if (filters.minPriority !== undefined) {
      results = results.filter((item) => item.priority >= filters.minPriority!);
    }
    if (filters.limit !== undefined) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async saveRequirements(requirements: ProjectRequirement[]): Promise<void> {
    this.requirements.push(...requirements);
  }

  async saveArchitecture(architecture: ProjectArchitecture): Promise<void> {
    this.architectures.push(architecture);
  }

  async saveScope(scope: ProjectScope): Promise<void> {
    this.scopes.push(scope);
  }

  async saveMilestones(milestones: ProjectMilestone[]): Promise<void> {
    this.milestones.push(...milestones);
  }

  async saveBudget(budget: ProjectBudget): Promise<void> {
    this.budgets.push(budget);
  }

  async saveRisks(risks: ProjectRisk[]): Promise<void> {
    this.risks.push(...risks);
  }

  async saveROI(roi: ProjectROI): Promise<void> {
    this.rois.push(roi);
  }

  async saveApproval(approval: ProjectApproval): Promise<void> {
    this.approvals.push(approval);
  }

  async saveExecutionPlan(plan: ProjectExecutionPlan): Promise<void> {
    this.executionPlans.push(plan);
  }

  async findApprovals(companyId: string): Promise<ProjectApproval[]> {
    return this.approvals.filter((approval) => approval.companyId === companyId);
  }
}
