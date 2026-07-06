import { KnowledgeRecordNotFoundError } from "../../shared";
import { KnowledgeRelation, createKnowledgeLinkedEvent } from "../../domain";
import type { LinkKnowledgeDto } from "../dto";
import type { ExecutiveKnowledgeEngineDependencies } from "../dependencies";

export class LinkKnowledgeUseCase {
  constructor(private readonly deps: ExecutiveKnowledgeEngineDependencies) {}

  async execute(dto: LinkKnowledgeDto) {
    const [source, target] = await Promise.all([
      this.deps.repository.findById(dto.sourceRecordId),
      this.deps.repository.findById(dto.targetRecordId),
    ]);

    if (!source) {
      throw new KnowledgeRecordNotFoundError(dto.sourceRecordId);
    }
    if (!target) {
      throw new KnowledgeRecordNotFoundError(dto.targetRecordId);
    }

    const relation = KnowledgeRelation.create({
      sourceRecordId: dto.sourceRecordId,
      targetRecordId: dto.targetRecordId,
      relationType: dto.relationType,
      strength: dto.strength ?? 60,
    });

    await this.deps.repository.saveRelation(relation);

    await this.deps.eventDispatcher.publish(
      createKnowledgeLinkedEvent(relation, dto.companyId),
    );

    return relation;
  }
}
