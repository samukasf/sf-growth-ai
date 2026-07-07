import { CouncilOpinion } from "../../domain";
import type {
  OpinionCollector,
  SpecialistOpinionInput,
  SpecialistPort,
} from "../../domain/ports/opinion-collector.port";
import type { CouncilMember } from "../../domain";

export class DefaultOpinionCollector implements OpinionCollector {
  async collect(
    sessionId: string,
    members: CouncilMember[],
    query: string,
    context: Record<string, unknown>,
    specialists: SpecialistPort[],
  ) {
    const opinions: CouncilOpinion[] = [];
    const input: SpecialistOpinionInput = { query, context };

    for (const member of members) {
      if (member.role === "ceo") continue;

      const specialist = specialists.find((s) => s.role === member.role);
      if (!specialist) continue;

      const result = await specialist.provideOpinion(input);
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
        }),
      );
    }

    return opinions;
  }
}
