import type { ExecutiveEngineContribution } from "../../../domain";
import type { ExecutiveParticipantId } from "../../../shared";

export interface ExecutiveEnginePort {
  readonly participantId: ExecutiveParticipantId;
  contribute(query: string, context: Record<string, unknown>): Promise<ExecutiveEngineContribution>;
}

export interface ExecutiveMemoryPort extends ExecutiveEnginePort {
  participantId: "memory";
}

export interface ExecutiveKnowledgePort extends ExecutiveEnginePort {
  participantId: "knowledge";
}

export interface ExecutiveLearningPort extends ExecutiveEnginePort {
  participantId: "learning";
}

export interface ExecutiveExperiencePort extends ExecutiveEnginePort {
  participantId: "experience";
}

export interface ExecutiveWisdomPort extends ExecutiveEnginePort {
  participantId: "wisdom";
}

export interface ExecutiveInnovationPort extends ExecutiveEnginePort {
  participantId: "innovation";
}

export interface ExecutiveProjectGeneratorPort extends ExecutiveEnginePort {
  participantId: "project_generator";
}

export interface CompanyBrainPort {
  enrichContext(query: string, companyId: string): Promise<Record<string, unknown>>;
}

export interface AIProviderPort {
  isAvailable(): boolean;
}

export interface ExecutiveCEOPort {
  finalizeResponse(input: {
    query: string;
    consensus: string;
    recommendation: string;
    confidence: number;
  }): Promise<string>;
}

export interface ExecutiveContextPort extends ExecutiveEnginePort {
  participantId: "executive_context";
}

export interface ExecutiveParticipantRegistry {
  getPort(participantId: ExecutiveParticipantId): ExecutiveEnginePort | null;
  getAllPorts(): ExecutiveEnginePort[];
}

export type { EnterpriseBrainRuntimePort } from "./enterprise-brain-runtime.port";
