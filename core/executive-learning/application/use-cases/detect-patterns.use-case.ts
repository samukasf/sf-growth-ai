import { createPatternDetectedEvent } from "../../domain";
import type { ExecutiveLearningEngineDependencies } from "../dependencies";

export class DetectPatternsUseCase {
  constructor(private readonly deps: ExecutiveLearningEngineDependencies) {}

  async execute(companyId: string) {
    const records = await this.deps.repository.findRecordsByCompany(companyId);
    const patterns = this.deps.patternDetector.detect(records);

    for (const pattern of patterns) {
      await this.deps.repository.savePattern(pattern);
      await this.deps.eventDispatcher.publish(createPatternDetectedEvent(pattern));
      await this.deps.executiveWisdom.registerFromPattern(pattern);

      const primaryRecord = records.find((record) =>
        pattern.relatedRecordIds.includes(record.id),
      );

      if (primaryRecord) {
        await this.deps.executiveMemory.syncLearning({
          companyId,
          record: primaryRecord.toJSON(),
          syncReason: "pattern_detected",
        });
      }
    }

    return patterns;
  }
}
