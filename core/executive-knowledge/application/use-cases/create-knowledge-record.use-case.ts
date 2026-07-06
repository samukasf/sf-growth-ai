import {
  KnowledgeCategory,
  KnowledgeMetadata,
  KnowledgeRecord,
  KnowledgeSource,
  createKnowledgeCreatedEvent,
} from "../../domain";
import type { CreateKnowledgeRecordDto } from "../dto";
import type { ExecutiveKnowledgeEngineDependencies } from "../dependencies";

export class CreateKnowledgeRecordUseCase {
  constructor(private readonly deps: ExecutiveKnowledgeEngineDependencies) {}

  async execute(dto: CreateKnowledgeRecordDto): Promise<KnowledgeRecord> {
    const classification = this.deps.classifier.classify({
      title: dto.title,
      content: dto.content,
      sourceOrigin: dto.sourceOrigin,
      tags: dto.tags,
    });

    const record = KnowledgeRecord.create({
      companyId: dto.companyId,
      source: KnowledgeSource.create({
        type: dto.sourceType,
        origin: dto.sourceOrigin,
        referenceId: dto.sourceReferenceId,
        capturedAt: new Date().toISOString(),
      }),
      domain: dto.domain ?? classification.domain,
      category:
        dto.categoryKind && dto.categoryLabel
          ? KnowledgeCategory.create({
              kind: dto.categoryKind,
              label: dto.categoryLabel,
              executiveDomain: dto.domain ?? classification.domain,
            })
          : classification.category,
      title: dto.title,
      summary: dto.summary,
      content: dto.content,
      confidence: dto.confidence ?? 50,
      importance: dto.importance ?? 50,
      relevance: dto.relevance ?? 50,
      tags: [...(dto.tags ?? []), ...classification.suggestedTags],
      references: dto.references ?? [],
      metadata: KnowledgeMetadata.create({
        involvedModules: dto.involvedModules,
        responsibleEngine: dto.responsibleEngine,
        userId: dto.userId,
      }),
    });

    const quality = this.deps.qualityEvaluator.evaluate(record);
    const enriched = record.updateContent({
      confidence: Math.round((record.confidence + quality.confidenceScore) / 2),
    });

    await this.deps.repository.save(enriched);
    await this.deps.indexer.index(enriched);

    const event = createKnowledgeCreatedEvent(enriched);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncKnowledge({
      companyId: enriched.companyId,
      record: enriched.toJSON(),
      syncReason: "created",
    });
    await this.deps.companyBrain.notifyKnowledgeChange(enriched);
    await this.deps.executiveLearning.onKnowledgeDomainEvent(event);

    return enriched;
  }
}
