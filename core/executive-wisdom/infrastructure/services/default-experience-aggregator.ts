import { clampScore } from "../../shared";
import type {
  ExecutiveExperience,
  ExecutiveWisdom,
  ExperienceAggregator,
  WisdomExperienceAggregation,
} from "../../domain";

export class DefaultExperienceAggregator implements ExperienceAggregator {
  aggregate(
    companyId: string,
    wisdomItems: ExecutiveWisdom[],
    experiences: ExecutiveExperience[],
  ): WisdomExperienceAggregation {
    const averageSuccessLevel =
      experiences.length === 0
        ? 0
        : clampScore(
            experiences.reduce((sum, item) => sum + item.successLevel, 0) /
              experiences.length,
          );

    const topWisdomIds = [...wisdomItems]
      .sort((left, right) => right.confidence - left.confidence)
      .slice(0, 5)
      .map((item) => item.id);

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
      topWisdomIds,
      recentExperiences,
    };
  }
}
