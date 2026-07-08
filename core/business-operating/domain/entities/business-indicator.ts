import type {
  AgencyId,
  BusinessIndicatorId,
  BusinessIndicatorTrend,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessIndicatorProps = {
  id: BusinessIndicatorId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  name: string;
  department: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: BusinessIndicatorTrend;
  measuredAt: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessIndicator {
  readonly id: BusinessIndicatorId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly department: string;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly unit: string;
  readonly trend: BusinessIndicatorTrend;
  readonly measuredAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessIndicatorProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.name = props.name;
    this.department = props.department;
    this.currentValue = props.currentValue;
    this.targetValue = props.targetValue;
    this.unit = props.unit;
    this.trend = props.trend;
    this.measuredAt = props.measuredAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessIndicatorProps, "id" | "createdAt" | "updatedAt" | "trend" | "measuredAt"> & {
      id?: BusinessIndicatorId;
      trend?: BusinessIndicatorTrend;
      measuredAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessIndicator {
    if (!props.name.trim()) throw new Error("name is required");
    const now = new Date().toISOString();
    return new BusinessIndicator({
      id: props.id ?? `bind-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      name: props.name.trim(),
      department: props.department,
      currentValue: props.currentValue,
      targetValue: props.targetValue,
      unit: props.unit,
      trend: props.trend ?? "stable",
      measuredAt: props.measuredAt ?? now,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  isOnTrack(): boolean {
    return this.currentValue >= this.targetValue * 0.8;
  }

  toJSON(): BusinessIndicatorProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      name: this.name,
      department: this.department,
      currentValue: this.currentValue,
      targetValue: this.targetValue,
      unit: this.unit,
      trend: this.trend,
      measuredAt: this.measuredAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
