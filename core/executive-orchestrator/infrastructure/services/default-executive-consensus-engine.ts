import {
  ExecutiveConsensus,
  type ExecutiveConsensusEngine,
  type ExecutiveEngineContribution,
  type ExecutiveRequest,
} from "../../domain";

export class DefaultExecutiveConsensusEngine implements ExecutiveConsensusEngine {
  start(
    request: ExecutiveRequest,
    contributions: ExecutiveEngineContribution[],
  ): ExecutiveConsensus {
    return ExecutiveConsensus.create({
      companyId: request.companyId,
      requestId: request.id,
      contributions,
      consolidatedOpinion: "",
      consolidatedRecommendation: "",
      averageConfidence: 0,
      averagePriority: 0,
      consolidatedRisks: [],
      consolidatedOpportunities: [],
      status: "in_progress",
    });
  }

  consolidate(consensus: ExecutiveConsensus): ExecutiveConsensus {
    if (consensus.contributions.length === 0) {
      return consensus.complete();
    }

    const avgConfidence =
      consensus.contributions.reduce((sum, c) => sum + c.confidence, 0) /
      consensus.contributions.length;
    const avgPriority =
      consensus.contributions.reduce((sum, c) => sum + c.priority, 0) /
      consensus.contributions.length;

    const consolidatedOpinion = consensus.contributions
      .map((c) => `[${c.participantId}] ${c.opinion}`)
      .join(" | ");

    const consolidatedRecommendation = consensus.contributions
      .map((c) => c.recommendation)
      .filter(Boolean)
      .join(" ");

    const consolidatedRisks = [
      ...new Set(consensus.contributions.flatMap((c) => c.risks)),
    ];
    const consolidatedOpportunities = [
      ...new Set(consensus.contributions.flatMap((c) => c.opportunities)),
    ];

    return ExecutiveConsensus.create({
      ...consensus.toJSON(),
      consolidatedOpinion,
      consolidatedRecommendation,
      averageConfidence: Math.round(avgConfidence),
      averagePriority: Math.round(avgPriority),
      consolidatedRisks,
      consolidatedOpportunities,
      status: "completed",
      completedAt: new Date().toISOString(),
    }).complete();
  }
}
