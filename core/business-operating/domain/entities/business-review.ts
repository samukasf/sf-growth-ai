import type {
  AgencyId,
  BusinessReviewId,
  BusinessReviewStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessReviewSummary = {
  operationsCompleted: number;
  alertsResolved: number;
  objectivesProgress: number;
  healthScore: number;
  topPriorities: string[];
};

export type BusinessReviewProps = {
  id: BusinessReviewId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  businessDayId: string;
  title: string;
  status: BusinessReviewStatus;
  summary: BusinessReviewSummary;
  insights: string[];
  recommendations: string[];
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessReview {
  readonly id: BusinessReviewId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly businessDayId: string;
  readonly title: string;
  readonly status: BusinessReviewStatus;
  readonly summary: BusinessReviewSummary;
  readonly insights: string[];
  readonly recommendations: string[];
  readonly reviewedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessReviewProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.businessDayId = props.businessDayId;
    this.title = props.title;
    this.status = props.status;
    this.summary = { ...props.summary, topPriorities: [...props.summary.topPriorities] };
    this.insights = [...props.insights];
    this.recommendations = [...props.recommendations];
    this.reviewedAt = props.reviewedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessReviewProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: BusinessReviewId;
      status?: BusinessReviewStatus;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessReview {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessReview({
      id: props.id ?? `brev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      businessDayId: props.businessDayId,
      title: props.title.trim(),
      status: props.status ?? "draft",
      summary: props.summary,
      insights: props.insights,
      recommendations: props.recommendations,
      reviewedAt: props.reviewedAt,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  complete(): BusinessReview {
    return BusinessReview.create({
      ...this.toJSON(),
      status: "completed",
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessReviewProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      businessDayId: this.businessDayId,
      title: this.title,
      status: this.status,
      summary: { ...this.summary, topPriorities: [...this.summary.topPriorities] },
      insights: [...this.insights],
      recommendations: [...this.recommendations],
      reviewedAt: this.reviewedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
