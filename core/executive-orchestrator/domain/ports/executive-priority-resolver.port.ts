import type { ExecutiveParticipantId } from "../../shared";

export interface ExecutivePriorityResolver {
  resolve(participants: ExecutiveParticipantId[]): ExecutiveParticipantId[];
}
