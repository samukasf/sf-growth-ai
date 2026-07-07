import type { CustomerJourney, JourneyAnalyzer } from "../../domain";

const STAGE_ORDER = [
  "awareness",
  "consideration",
  "decision",
  "onboarding",
  "retention",
  "expansion",
  "advocacy",
] as const;

export class DefaultJourneyAnalyzer implements JourneyAnalyzer {
  analyze(journey: CustomerJourney) {
    const completed = journey.milestones.filter((m) => m.status === "completed").length;
    const total = journey.milestones.length || 1;
    const stageIndex = STAGE_ORDER.indexOf(journey.currentStage);
    const stageProgress = Math.round(((stageIndex + 1) / STAGE_ORDER.length) * 100);

    return {
      customerId: journey.customerId,
      currentStage: journey.currentStage,
      healthScore: journey.healthScore,
      completedMilestones: completed,
      totalMilestones: total,
      nextBestAction:
        journey.nextBestAction ?? `Avançar para próxima etapa após ${journey.currentStage}`,
      stageProgress,
    };
  }

  suggestNextStage(journey: CustomerJourney): string {
    const currentIndex = STAGE_ORDER.indexOf(journey.currentStage);
    if (currentIndex < 0 || currentIndex >= STAGE_ORDER.length - 1) {
      return journey.currentStage;
    }
    return STAGE_ORDER[currentIndex + 1]!;
  }
}
