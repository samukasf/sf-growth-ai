import { ExecutiveWisdom, createWisdomCreatedEvent } from "../../domain";
import type { CreateExecutiveWisdomDto } from "../dto";
import type { ExecutiveWisdomEngineDependencies } from "../dependencies";

export class CreateExecutiveWisdomUseCase {
  constructor(private readonly deps: ExecutiveWisdomEngineDependencies) {}

  async execute(dto: CreateExecutiveWisdomDto) {
    const wisdom = ExecutiveWisdom.create({
      companyId: dto.companyId,
      knowledgeIds: dto.knowledgeIds ?? [],
      learningIds: dto.learningIds ?? [],
      confidence: dto.confidence ?? 50,
      importance: dto.importance ?? 50,
      businessImpact: dto.businessImpact ?? 50,
      risk: dto.risk ?? "medium",
      recommendation: dto.recommendation,
      reasoning: dto.reasoning ?? "",
      expectedOutcome: dto.expectedOutcome ?? "",
      successRate: dto.successRate ?? 50,
      roi: dto.roi ?? 0,
      tags: dto.tags ?? [],
    });

    const analysis = this.deps.analyzer.analyze(wisdom);
    const enriched = wisdom.update({
      confidence: Math.round((wisdom.confidence + analysis.decisionReadiness) / 2),
      tags: [...wisdom.tags, ...analysis.suggestedActions.slice(0, 2)],
    });

    await this.deps.repository.saveWisdom(enriched);

    const event = createWisdomCreatedEvent(enriched);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncWisdom({
      companyId: enriched.companyId,
      wisdom: enriched.toJSON(),
      syncReason: "created",
    });
    await this.deps.companyBrain.notifyWisdomChange(enriched);
    await this.deps.executiveKnowledge.linkWisdomToKnowledge({
      companyId: enriched.companyId,
      knowledgeIds: enriched.knowledgeIds,
      wisdomId: enriched.id,
    });
    await this.deps.executiveLearning.linkWisdomToLearning({
      companyId: enriched.companyId,
      learningIds: enriched.learningIds,
      wisdomId: enriched.id,
    });

    await this.deps.aiProvider.canEnhance({
      companyId: enriched.companyId,
      wisdom: enriched.toJSON(),
    });

    return enriched;
  }
}
