import type { OrganizationId, PipelineId, PipelineStageId } from "../../shared";

export type PipelineStageProps = {
  id: PipelineStageId;
  organizationId: OrganizationId;
  pipelineId: PipelineId;
  name: string;
  order: number;
  probability: number;
  color?: string;
};

export class PipelineStage {
  readonly id: PipelineStageId;
  readonly organizationId: OrganizationId;
  readonly pipelineId: PipelineId;
  readonly name: string;
  readonly order: number;
  readonly probability: number;
  readonly color?: string;

  private constructor(props: PipelineStageProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.pipelineId = props.pipelineId;
    this.name = props.name;
    this.order = props.order;
    this.probability = props.probability;
    this.color = props.color;
  }

  static create(
    props: Omit<PipelineStageProps, "id"> & { id?: PipelineStageId },
  ): PipelineStage {
    return new PipelineStage({
      id: props.id ?? `stage-${Date.now()}`,
      organizationId: props.organizationId,
      pipelineId: props.pipelineId,
      name: props.name.trim(),
      order: props.order,
      probability: props.probability,
      color: props.color,
    });
  }

  toJSON(): PipelineStageProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      pipelineId: this.pipelineId,
      name: this.name,
      order: this.order,
      probability: this.probability,
      color: this.color,
    };
  }
}
