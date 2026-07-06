import type { ExecutiveParticipantId } from "../../shared";
import type {
  ExecutiveParticipantRegistry,
  ExecutiveEnginePort,
} from "../../application/ports/integration";
import { createNoopEnginePort } from "./noop-engine.adapter";

const ALL_PARTICIPANTS: ExecutiveParticipantId[] = [
  "executive_context",
  "marketing",
  "sales",
  "finance",
  "forecast",
  "innovation",
  "operations",
  "experience",
  "wisdom",
  "legal",
  "hr",
  "project_generator",
  "crm",
  "google_business",
  "knowledge",
  "learning",
  "memory",
  "company_brain",
  "ceo",
];

export class DefaultParticipantRegistry implements ExecutiveParticipantRegistry {
  private readonly ports: Map<ExecutiveParticipantId, ExecutiveEnginePort>;

  constructor(customPorts?: ExecutiveEnginePort[]) {
    this.ports = new Map();

    for (const participantId of ALL_PARTICIPANTS) {
      this.ports.set(participantId, createNoopEnginePort(participantId));
    }

    for (const port of customPorts ?? []) {
      this.ports.set(port.participantId, port);
    }
  }

  getPort(participantId: ExecutiveParticipantId): ExecutiveEnginePort | null {
    return this.ports.get(participantId) ?? null;
  }

  getAllPorts(): ExecutiveEnginePort[] {
    return [...this.ports.values()];
  }
}
