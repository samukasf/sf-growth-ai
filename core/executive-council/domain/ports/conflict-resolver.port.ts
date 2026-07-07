import type { CouncilConflict, CouncilOpinion } from "../entities";

export interface ConflictResolver {
  detect(sessionId: string, opinions: CouncilOpinion[]): CouncilConflict[];
  resolve(conflicts: CouncilConflict[]): CouncilConflict[];
}
