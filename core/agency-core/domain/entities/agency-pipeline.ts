import type {
  AgencyClientId,
  AgencyId,
  AgencyPipelineId,
  AgencyPipelineStage,
  OrganizationId,
} from "../../shared";

export type AgencyPipelineProps = {
  id: AgencyPipelineId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  clientId: AgencyClientId;
  name: string;
  stage: AgencyPipelineStage;
  estimatedValue: number;
  createdAt: string;
  updatedAt: string;
};

export class AgencyPipeline {
  readonly id: AgencyPipelineId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly clientId: AgencyClientId;
  readonly name: string;
  readonly stage: AgencyPipelineStage;
  readonly estimatedValue: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: AgencyPipelineProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.clientId = props.clientId;
    this.name = props.name;
    this.stage = props.stage;
    this.estimatedValue = props.estimatedValue;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<AgencyPipelineProps, "id" | "createdAt" | "updatedAt" | "stage"> & {
      id?: AgencyPipelineId;
      stage?: AgencyPipelineStage;
      createdAt?: string;
      updatedAt?: string;
    },
  ): AgencyPipeline {
    const now = new Date().toISOString();
    return new AgencyPipeline({
      id: props.id ?? `apipeline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      clientId: props.clientId,
      name: props.name.trim(),
      stage: props.stage ?? "lead",
      estimatedValue: props.estimatedValue,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStage(stage: AgencyPipelineStage): AgencyPipeline {
    return AgencyPipeline.create({
      ...this.toJSON(),
      stage,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): AgencyPipelineProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      clientId: this.clientId,
      name: this.name,
      stage: this.stage,
      estimatedValue: this.estimatedValue,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
