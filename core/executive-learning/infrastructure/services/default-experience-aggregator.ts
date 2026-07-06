import { clampScore } from "../../shared";
import type {
  ExperienceAggregator,
  ExperienceAggregation,
  LearningExperience,
  LearningRecord,
} from "../../domain";

export class DefaultExperienceAggregator implements ExperienceAggregator {
  aggregate(
    companyId: string,
    records: LearningRecord[],
    experiences: LearningExperience[],
  ): ExperienceAggregation {
    const averageSuccessLevel =
      experiences.length === 0
        ? 0
        : clampScore(
            experiences.reduce((sum, item) => sum + item.successLevel, 0) / experiences.length,
          );

    const topLessons = records
      .flatMap((record) => record.lessonsLearned)
      .slice(0, 5);

    const recentExperiences = [...experiences]
      .sort(
        (left, right) =>
          new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime(),
      )
      .slice(0, 5);

    return {
      companyId,
      totalExperiences: experiences.length,
      averageSuccessLevel,
      topLessons,
      recentExperiences,
    };
  }
}
