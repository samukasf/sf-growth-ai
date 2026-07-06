import type { ExecutiveParticipantId } from "../../shared";

export interface ExecutiveDependencyResolver {
  resolve(participants: ExecutiveParticipantId[]): ExecutiveParticipantId[];
}
