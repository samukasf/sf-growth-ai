import type { OrganizationId, PipelineId } from "../../shared";
import type { Pipeline, PipelineStage } from "../entities";

export interface PipelineRepository {
  save(pipeline: Pipeline): Promise<void>;
  findById(id: PipelineId): Promise<Pipeline | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Pipeline[]>;
  saveStage(stage: PipelineStage): Promise<void>;
  findStagesByPipeline(pipelineId: PipelineId): Promise<PipelineStage[]>;
}
