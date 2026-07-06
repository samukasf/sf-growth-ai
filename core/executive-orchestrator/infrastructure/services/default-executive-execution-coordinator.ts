import {
  ExecutiveExecutionPlan,
  type ExecutiveConsensus,
  type ExecutiveExecutionCoordinator,
  type ExecutiveRequest,
} from "../../domain";
import type { ExecutiveParticipantId } from "../../shared";

export class DefaultExecutiveExecutionCoordinator implements ExecutiveExecutionCoordinator {
  coordinate(
    request: ExecutiveRequest,
    consensus: ExecutiveConsensus,
    participants: ExecutiveParticipantId[],
  ): ExecutiveExecutionPlan {
    const actions = participants
      .filter((p) => p !== "ceo")
      .map((participantId, index) => ({
        participantId,
        action: `Executar recomendação de ${participantId}`,
        order: index + 1,
        estimatedDays: 7,
      }));

    return ExecutiveExecutionPlan.create({
      companyId: request.companyId,
      requestId: request.id,
      summary: `Plano de execução para: ${request.query}`,
      actions,
    });
  }
}
