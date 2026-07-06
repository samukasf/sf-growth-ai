import { clampScore } from "../../shared";
import type {
  ExecutiveExperience,
  ExperienceScoreBreakdown,
  ExperienceScoreCalculator,
} from "../../domain";

export class DefaultExperienceScoreCalculator implements ExperienceScoreCalculator {
  calculate(experience: ExecutiveExperience): ExperienceScoreBreakdown {
    const successScore = clampScore(experience.successLevel);
    const impactScore = clampScore(experience.businessImpact);
    const confidenceScore = clampScore(experience.confidence);
    const roiScore = clampScore(Math.min(100, Math.max(0, experience.roi * 10 + 50)));
    const durationScore = clampScore(experience.duration > 0 ? 70 : 40);

    const overallScore = clampScore(
      (successScore + impactScore + confidenceScore + roiScore + durationScore) / 5,
    );

    return {
      experienceId: experience.id,
      overallScore,
      successScore,
      impactScore,
      confidenceScore,
      roiScore,
      durationScore,
    };
  }

  meetsValidationThreshold(experience: ExecutiveExperience, threshold = 55): boolean {
    return this.calculate(experience).overallScore >= threshold;
  }
}
