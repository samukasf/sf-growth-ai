import type { CompanyId, ExecutiveProjectId, ProjectBudgetId } from "../../shared";

export type ProjectBudgetProps = {
  id: ProjectBudgetId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  developmentCost: number;
  infrastructureCost: number;
  maintenanceCost: number;
  contingency: number;
  totalCost: number;
  currency: string;
};

export class ProjectBudget {
  readonly id: ProjectBudgetId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly developmentCost: number;
  readonly infrastructureCost: number;
  readonly maintenanceCost: number;
  readonly contingency: number;
  readonly totalCost: number;
  readonly currency: string;

  private constructor(props: ProjectBudgetProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.developmentCost = props.developmentCost;
    this.infrastructureCost = props.infrastructureCost;
    this.maintenanceCost = props.maintenanceCost;
    this.contingency = props.contingency;
    this.totalCost = props.totalCost;
    this.currency = props.currency;
  }

  static create(
    props: Omit<ProjectBudgetProps, "id" | "totalCost"> & { id?: ProjectBudgetId },
  ): ProjectBudget {
    const totalCost =
      props.developmentCost +
      props.infrastructureCost +
      props.maintenanceCost +
      props.contingency;

    return new ProjectBudget({
      id: props.id ?? `budget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      developmentCost: Math.max(0, props.developmentCost),
      infrastructureCost: Math.max(0, props.infrastructureCost),
      maintenanceCost: Math.max(0, props.maintenanceCost),
      contingency: Math.max(0, props.contingency),
      totalCost,
      currency: props.currency,
    });
  }

  toJSON(): ProjectBudgetProps {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      developmentCost: this.developmentCost,
      infrastructureCost: this.infrastructureCost,
      maintenanceCost: this.maintenanceCost,
      contingency: this.contingency,
      totalCost: this.totalCost,
      currency: this.currency,
    };
  }
}
