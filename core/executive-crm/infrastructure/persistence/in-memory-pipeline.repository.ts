import { Pipeline, PipelineStage, type PipelineRepository } from "../../domain";

function serializePipeline(pipeline: Pipeline): string {
  return JSON.stringify(pipeline.toJSON());
}

function deserializePipeline(raw: string): Pipeline {
  return Pipeline.create(JSON.parse(raw) as ReturnType<Pipeline["toJSON"]>);
}

export class InMemoryPipelineRepository implements PipelineRepository {
  private readonly pipelines = new Map<string, string>();
  private readonly stages: PipelineStage[] = [];

  async save(pipeline: Pipeline): Promise<void> {
    this.pipelines.set(pipeline.id, serializePipeline(pipeline));
  }

  async findById(id: string): Promise<Pipeline | null> {
    const raw = this.pipelines.get(id);
    return raw ? deserializePipeline(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Pipeline[]> {
    const results: Pipeline[] = [];
    for (const raw of this.pipelines.values()) {
      const pipeline = deserializePipeline(raw);
      if (pipeline.organizationId === organizationId) results.push(pipeline);
    }
    return results;
  }

  async saveStage(stage: PipelineStage): Promise<void> {
    this.stages.push(stage);
  }

  async findStagesByPipeline(pipelineId: string): Promise<PipelineStage[]> {
    return this.stages
      .filter((s) => s.pipelineId === pipelineId)
      .sort((a, b) => a.order - b.order);
  }
}
