import type { ExecutiveParticipantId } from "../../shared";
import type { ExecutiveDependencyResolver } from "../../domain";

const DEPENDENCIES: Partial<Record<ExecutiveParticipantId, ExecutiveParticipantId[]>> = {
  marketing: ["executive_context"],
  sales: ["executive_context", "marketing"],
  finance: ["executive_context"],
  forecast: ["finance", "executive_context"],
  innovation: ["executive_context", "experience"],
  operations: ["executive_context"],
  experience: ["executive_context", "memory"],
  wisdom: ["experience", "learning"],
  project_generator: ["innovation", "finance"],
  crm: ["sales", "marketing"],
  google_business: ["marketing", "crm"],
  ceo: ["executive_context"],
};

export class DefaultExecutiveDependencyResolver implements ExecutiveDependencyResolver {
  resolve(participants: ExecutiveParticipantId[]): ExecutiveParticipantId[] {
    const resolved = new Set<ExecutiveParticipantId>(participants);

    for (const participant of participants) {
      const deps = DEPENDENCIES[participant] ?? [];
      for (const dep of deps) {
        resolved.add(dep);
      }
    }

    return [...resolved];
  }
}
