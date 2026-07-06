import type { CompanyId, ExecutiveProjectId, ProjectROIId } from "../../shared";

export type ProjectROIProps = {
  id: ProjectROIId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  estimatedReturn: number;
  estimatedCost: number;
  paybackMonths: number;
  confidence: number;
};

export class ProjectROI {
  readonly id: ProjectROIId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly estimatedReturn: number;
  readonly estimatedCost: number;
  readonly paybackMonths: number;
  readonly confidence: number;

  private constructor(props: ProjectROIProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.estimatedReturn = props.estimatedReturn;
    this.estimatedCost = props.estimatedCost;
    this.paybackMonths = props.paybackMonths;
    this.confidence = props.confidence;
  }

  static create(
    props: Omit<ProjectROIProps, "id"> & { id?: ProjectROIId },
  ): ProjectROI {
    return new ProjectROI({
      id: props.id ?? `proj-roi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      estimatedReturn: props.estimatedReturn,
      estimatedCost: Math.max(0, props.estimatedCost),
      paybackMonths: Math.max(0, props.paybackMonths),
      confidence: Math.max(0, Math.min(100, props.confidence)),
    });
  }

  get roiRatio(): number {
    if (this.estimatedCost === 0) return this.estimatedReturn > 0 ? Infinity : 0;
    return this.estimatedReturn / this.estimatedCost;
  }

  toJSON(): ProjectROIProps & { roiRatio: number } {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      estimatedReturn: this.estimatedReturn,
      estimatedCost: this.estimatedCost,
      paybackMonths: this.paybackMonths,
      confidence: this.confidence,
      roiRatio: this.roiRatio,
    };
  }
}
