import type {
  KnowledgeRetrievalInput,
  KnowledgeRetrievalResult,
} from "../executive-knowledge.types";
import {
  markKnowledgeReused,
  retrieveExecutiveKnowledge,
} from "./executive-knowledge.service";
import { registerLearningEvent } from "./executive-learning-events.service";

export type KnowledgeRetrievalFlowResult = KnowledgeRetrievalResult & {
  source: "internal-knowledge" | "ai-provider-required";
};

export function searchKnowledgeBase(
  input: KnowledgeRetrievalInput,
): KnowledgeRetrievalResult {
  return retrieveExecutiveKnowledge(input);
}

export async function resolveKnowledgeQuery(
  input: KnowledgeRetrievalInput,
): Promise<KnowledgeRetrievalFlowResult> {
  const retrieval = retrieveExecutiveKnowledge(input);

  if (retrieval.canAnswerFromKnowledge && retrieval.records[0]) {
    await markKnowledgeReused(input.companyId, retrieval.records[0].id);
    await registerLearningEvent({
      companyId: input.companyId,
      type: "knowledge_reused",
      title: "Conhecimento reutilizado",
      description: `Resposta recuperada da base interna para: ${input.query}`,
      knowledgeRecordId: retrieval.records[0].id,
      metadata: {
        query: input.query,
        aggregateConfidence: String(retrieval.aggregateConfidence),
      },
    });

    return {
      ...retrieval,
      source: "internal-knowledge",
    };
  }

  return {
    ...retrieval,
    source: "ai-provider-required",
  };
}

export function canAnswerFromInternalKnowledge(
  input: KnowledgeRetrievalInput,
): boolean {
  return retrieveExecutiveKnowledge(input).canAnswerFromKnowledge;
}
