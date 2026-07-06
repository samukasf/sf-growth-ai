import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveLesson } from "../entities";

export type LessonLearnedPayload = {
  lesson: ReturnType<ExecutiveLesson["toJSON"]>;
};

export type LessonLearnedEvent = DomainEvent<LessonLearnedPayload>;

export function createLessonLearnedEvent(lesson: ExecutiveLesson): LessonLearnedEvent {
  return createDomainEvent({
    eventType: "LessonLearned",
    aggregateId: lesson.wisdomId,
    companyId: lesson.companyId,
    payload: { lesson: lesson.toJSON() },
  });
}
