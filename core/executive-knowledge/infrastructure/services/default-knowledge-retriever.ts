import type {
  KnowledgeRecord,
  KnowledgeRetrievalQuery,
  KnowledgeRetrievalResult,
  KnowledgeRetriever,
} from "../../domain";

function tokenize(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function computeScore(query: string, record: KnowledgeRecord): { score: number; matchedTerms: string[] } {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return { score: 0, matchedTerms: [] };
  }

  const haystack = [record.title, record.summary, record.content, ...record.tags].join(" ").toLowerCase();
  const matchedTerms = queryTokens.filter((token) => haystack.includes(token));
  const tokenRatio = matchedTerms.length / queryTokens.length;
  const importanceBoost = record.importance / 200;
  const confidenceBoost = record.confidence / 200;
  const relevanceBoost = record.relevance / 200;

  const score = Math.min(
    100,
    Math.round((tokenRatio * 60 + importanceBoost + confidenceBoost + relevanceBoost) * 100) / 100,
  );

  return { score, matchedTerms };
}

export class DefaultKnowledgeRetriever implements KnowledgeRetriever {
  retrieve(records: KnowledgeRecord[], query: KnowledgeRetrievalQuery): KnowledgeRetrievalResult {
    const minRelevance = query.minRelevance ?? 20;
    const limit = query.limit ?? 10;

    const matches = records
      .map((record) => {
        const { score, matchedTerms } = computeScore(query.query, record);
        return { record, score, matchedTerms };
      })
      .filter((match) => match.score >= minRelevance)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);

    const aggregateScore =
      matches.length === 0
        ? 0
        : Math.round(matches.reduce((sum, match) => sum + match.score, 0) / matches.length);

    return {
      query: query.query,
      matches,
      sufficient: matches.length > 0 && aggregateScore >= 45,
      aggregateScore,
    };
  }
}
