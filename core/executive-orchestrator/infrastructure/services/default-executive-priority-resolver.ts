import type { ExecutiveParticipantId } from "../../shared";
import type { ExecutivePriorityResolver } from "../../domain";

const PRIORITY_ORDER: ExecutiveParticipantId[] = [
  "executive_context",
  "memory",
  "knowledge",
  "learning",
  "experience",
  "wisdom",
  "operations",
  "finance",
  "marketing",
  "sales",
  "forecast",
  "innovation",
  "project_generator",
  "crm",
  "google_business",
  "legal",
  "hr",
  "company_brain",
  "ceo",
];

export class DefaultExecutivePriorityResolver implements ExecutivePriorityResolver {
  resolve(participants: ExecutiveParticipantId[]): ExecutiveParticipantId[] {
    return [...participants].sort((a, b) => {
      const indexA = PRIORITY_ORDER.indexOf(a);
      const indexB = PRIORITY_ORDER.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }
}
