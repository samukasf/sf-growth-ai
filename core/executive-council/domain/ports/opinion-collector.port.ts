import type { CouncilMember, CouncilOpinion } from "../entities";

export type SpecialistOpinionInput = {
  query: string;
  context: Record<string, unknown>;
};

export type SpecialistOpinionResult = {
  summary: string;
  recommendation: string;
  priority: number;
  confidence: number;
  risks: string[];
  opportunities: string[];
  /**
   * Campos aditivos (Sprint 78 — Executive Council Intelligence), populados
   * pelos especialistas de IA (`ai-council-specialist.adapter.ts`).
   * Continuam opcionais para não quebrar especialistas heurísticos.
   */
  conclusion?: string;
  justification?: string;
  providerId?: string;
  model?: string;
};

export interface SpecialistPort {
  readonly role: import("../../shared").CouncilSpecialistRole;
  provideOpinion(input: SpecialistOpinionInput): Promise<SpecialistOpinionResult>;
}

/** Falha isolada de um conselheiro específico (Sprint 78). */
export type OpinionFailure = {
  role: import("../../shared").CouncilSpecialistRole;
  error: string;
};

/**
 * Resultado da coleta de pareceres (Sprint 78): além dos pareceres obtidos
 * com sucesso, expõe as falhas isoladas por papel — nenhum conselheiro que
 * falhar interrompe os demais nem a sessão do Council.
 */
export type OpinionCollectionResult = {
  opinions: CouncilOpinion[];
  failures: OpinionFailure[];
};

export interface OpinionCollector {
  collect(
    sessionId: string,
    members: CouncilMember[],
    query: string,
    context: Record<string, unknown>,
    specialists: SpecialistPort[],
  ): Promise<OpinionCollectionResult>;
}
