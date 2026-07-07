import { CouncilConflict } from "../../domain";
import type { ConflictResolver } from "../../domain/ports/conflict-resolver.port";
import type { CouncilOpinion } from "../../domain";

export class DefaultConflictResolver implements ConflictResolver {
  detect(sessionId: string, opinions: CouncilOpinion[]) {
    const conflicts: CouncilConflict[] = [];
    const highPriority = opinions.filter((o) => o.priority >= 80);
    const lowConfidence = opinions.filter((o) => o.confidence < 40);

    if (highPriority.length >= 2) {
      const roles = highPriority.map((o) => o.role);
      conflicts.push(
        CouncilConflict.create({
          sessionId,
          topic: "Priority alignment",
          roles,
          description: `Multiple high-priority opinions from: ${roles.join(", ")}`,
        }),
      );
    }

    if (lowConfidence.length >= 2) {
      conflicts.push(
        CouncilConflict.create({
          sessionId,
          topic: "Confidence gap",
          roles: lowConfidence.map((o) => o.role),
          description: "Low confidence opinions require further deliberation",
        }),
      );
    }

    return conflicts;
  }

  resolve(conflicts: CouncilConflict[]) {
    return conflicts.map((conflict) => conflict.resolve());
  }
}
