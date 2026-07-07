import type { OrganizationId, PipelineId } from "../../shared";

export type PipelineType = "sales" | "partnership" | "renewal" | "custom";

export type PipelineProps = {
  id: PipelineId;
  organizationId: OrganizationId;
  name: string;
  description: string;
  type: PipelineType;
  stageIds: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export class Pipeline {
  readonly id: PipelineId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string;
  readonly type: PipelineType;
  readonly stageIds: string[];
  readonly isDefault: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: PipelineProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.description = props.description;
    this.type = props.type;
    this.stageIds = [...props.stageIds];
    this.isDefault = props.isDefault;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<PipelineProps, "id" | "createdAt" | "updatedAt"> & {
      id?: PipelineId;
      createdAt?: string;
      updatedAt?: string;
    },
  ): Pipeline {
    const now = new Date().toISOString();
    return new Pipeline({
      id: props.id ?? `pipeline-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      description: props.description.trim(),
      type: props.type,
      stageIds: props.stageIds,
      isDefault: props.isDefault,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): PipelineProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      description: this.description,
      type: this.type,
      stageIds: [...this.stageIds],
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
