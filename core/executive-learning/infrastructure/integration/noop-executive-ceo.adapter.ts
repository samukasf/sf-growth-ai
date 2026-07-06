import type { ExecutiveCEOBriefingUpdate, ExecutiveCEOPort } from "../../application";
import type { LearningRecord } from "../../domain";

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  async notifyLearningInsight(update: ExecutiveCEOBriefingUpdate): Promise<void> {
    void update;
  }

  async summarizeLearningImpact(records: LearningRecord[]): Promise<string[]> {
    return records.flatMap((record) => record.lessonsLearned).slice(0, 3);
  }
}
