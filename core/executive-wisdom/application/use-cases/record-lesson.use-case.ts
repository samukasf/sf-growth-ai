import { ExecutiveWisdomNotFoundError } from "../../shared";
import {
  ExecutiveLesson,
  createBusinessRuleCreatedEvent,
  createLessonLearnedEvent,
} from "../../domain";
import type { RecordLessonDto } from "../dto";
import type { ExecutiveWisdomEngineDependencies } from "../dependencies";

export class RecordLessonUseCase {
  constructor(private readonly deps: ExecutiveWisdomEngineDependencies) {}

  async execute(dto: RecordLessonDto) {
    const wisdom = await this.deps.repository.findWisdomById(dto.wisdomId);
    if (!wisdom) {
      throw new ExecutiveWisdomNotFoundError(dto.wisdomId);
    }

    const lesson = ExecutiveLesson.create({
      companyId: dto.companyId,
      wisdomId: dto.wisdomId,
      title: dto.title,
      description: dto.description,
      source: dto.source,
      impact: dto.impact ?? wisdom.businessImpact,
    });

    await this.deps.repository.saveLesson(lesson);
    await this.deps.eventDispatcher.publish(createLessonLearnedEvent(lesson));

    const rules = this.deps.businessRuleEngine.deriveRules(wisdom);
    for (const rule of rules) {
      await this.deps.repository.saveBusinessRule(rule);
      await this.deps.eventDispatcher.publish(createBusinessRuleCreatedEvent(rule));
    }

    return { lesson, rules };
  }
}
