import type { ExecutiveConsensus, ExecutiveEngineContribution, ExecutiveRequest } from "../entities";

export interface ExecutiveConsensusEngine {
  start(request: ExecutiveRequest, contributions: ExecutiveEngineContribution[]): ExecutiveConsensus;
  consolidate(consensus: ExecutiveConsensus): ExecutiveConsensus;
}
