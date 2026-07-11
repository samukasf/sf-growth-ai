import { CouncilOpinion } from "../../domain";
import type {
  OpinionCollectionResult,
  OpinionCollector,
  OpinionFailure,
  SpecialistOpinionInput,
  SpecialistPort,
} from "../../domain/ports/opinion-collector.port";
import type { CouncilMember } from "../../domain";

/**
 * Coletor de pareceres resiliente (Sprint 78): cada conselheiro é executado
 * de forma isolada via `Promise.allSettled`. Se um especialista falhar
 * (provider de IA indisponível, timeout, kill-switch), o erro é registrado
 * em `failures` e os demais pareceres continuam sendo coletados
 * normalmente — nenhuma falha individual interrompe a sessão do Council.
 */
export class DefaultOpinionCollector implements OpinionCollector {
  async collect(
    sessionId: string,
    members: CouncilMember[],
    query: string,
    context: Record<string, unknown>,
    specialists: SpecialistPort[],
  ): Promise<OpinionCollectionResult> {
    const input: SpecialistOpinionInput = { query, context };

    const eligible = members
      .filter((member) => member.role !== "ceo")
      .map((member) => ({
        member,
        specialist: specialists.find((s) => s.role === member.role),
      }))
      .filter((entry): entry is { member: CouncilMember; specialist: SpecialistPort } =>
        Boolean(entry.specialist),
      );

    const settled = await Promise.allSettled(
      eligible.map((entry) => entry.specialist.provideOpinion(input)),
    );

    const opinions: CouncilOpinion[] = [];
    const failures: OpinionFailure[] = [];

    settled.forEach((outcome, index) => {
      const { member } = eligible[index];

      if (outcome.status === "fulfilled") {
        const result = outcome.value;
        opinions.push(
          CouncilOpinion.create({
            sessionId,
            memberId: member.id,
            role: member.role,
            summary: result.summary,
            recommendation: result.recommendation,
            priority: result.priority,
            confidence: result.confidence,
            risks: result.risks,
            opportunities: result.opportunities,
            conclusion: result.conclusion,
            justification: result.justification,
            providerId: result.providerId,
            model: result.model,
          }),
        );
        return;
      }

      const error =
        outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      console.warn(
        `[executive-council] Parecer do conselheiro "${member.role}" falhou e foi ignorado: ${error}`,
      );
      failures.push({ role: member.role, error });
    });

    return { opinions, failures };
  }
}
