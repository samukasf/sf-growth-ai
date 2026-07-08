import type {
  AgencyId,
  BusinessPriorityId,
  BusinessPriorityLevel,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessPriorityProps = {
  id: BusinessPriorityId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  title: string;
  level: BusinessPriorityLevel;
  score: number;
  department: string;
  sourceType: "operation" | "alert" | "objective" | "routine";
  sourceId: string;
  rank: number;
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessPriority {
  readonly id: BusinessPriorityId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly level: BusinessPriorityLevel;
  readonly score: number;
  readonly department: string;
  readonly sourceType: "operation" | "alert" | "objective" | "routine";
  readonly sourceId: string;
  readonly rank: number;
  readonly calculatedAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessPriorityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.level = props.level;
    this.score = props.score;
    this.department = props.department;
    this.sourceType = props.sourceType;
    this.sourceId = props.sourceId;
    this.rank = props.rank;
    this.calculatedAt = props.calculatedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessPriorityProps, "id" | "createdAt" | "updatedAt" | "calculatedAt"> & {
      id?: BusinessPriorityId;
      calculatedAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessPriority {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessPriority({
      id: props.id ?? `bpri-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      title: props.title.trim(),
      level: props.level,
      score: props.score,
      department: props.department,
      sourceType: props.sourceType,
      sourceId: props.sourceId,
      rank: props.rank,
      calculatedAt: props.calculatedAt ?? now,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): BusinessPriorityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      title: this.title,
      level: this.level,
      score: this.score,
      department: this.department,
      sourceType: this.sourceType,
      sourceId: this.sourceId,
      rank: this.rank,
      calculatedAt: this.calculatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
