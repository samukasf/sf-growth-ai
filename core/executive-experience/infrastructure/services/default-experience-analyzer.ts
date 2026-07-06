import { clampScore } from "../../shared";
import type {
  ExecutiveExperience,
  ExperienceAnalysisReport,
  ExperienceAnalyzer,
} from "../../domain";

export class DefaultExperienceAnalyzer implements ExperienceAnalyzer {
  analyze(experience: ExecutiveExperience): ExperienceAnalysisReport {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (experience.successLevel >= 70) strengths.push("High success level");
    if (experience.roi > 0) strengths.push(`Positive ROI: ${experience.roi}`);
    if (experience.businessImpact >= 70) strengths.push("Strong business impact");

    if (experience.isFailure()) weaknesses.push("Low success outcome");
    if (!experience.execution) weaknesses.push("Missing execution details");
    if (experience.risk === "high" || experience.risk === "critical") {
      weaknesses.push(`Elevated risk: ${experience.risk}`);
    }

    const decisionReadiness = clampScore(
      (experience.confidence + experience.successLevel + experience.businessImpact) / 3,
    );

    return {
      experienceId: experience.id,
      summary: `${experience.title}: ${experience.result}`,
      strengths,
      weaknesses,
      reusableInsights: experience.isSuccessful()
        ? [experience.execution, experience.decision].filter(Boolean)
        : ["Review failure and document prevention"],
      decisionReadiness,
    };
  }

  analyzeBatch(experiences: ExecutiveExperience[]): ExperienceAnalysisReport[] {
    return experiences.map((item) => this.analyze(item));
  }
}
