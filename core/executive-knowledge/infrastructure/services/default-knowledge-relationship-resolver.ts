import {
  KnowledgeRelation,
  type KnowledgeRecord,
  type KnowledgeRelationshipResolver,
  type ResolveRelationsInput,
  type ResolvedRelation,
} from "../../domain";

function sharedTags(left: KnowledgeRecord, right: KnowledgeRecord): string[] {
  return left.tags.filter((tag) => right.tags.includes(tag));
}

export class DefaultKnowledgeRelationshipResolver implements KnowledgeRelationshipResolver {
  resolve(input: ResolveRelationsInput): ResolvedRelation[] {
    const relationType = input.relationType ?? "related_to";

    return input.candidates
      .filter((candidate) => candidate.id !== input.source.id)
      .map((candidate) => {
        const overlap = sharedTags(input.source, candidate);
        const domainMatch = input.source.domain === candidate.domain;
        const strength = Math.min(100, overlap.length * 20 + (domainMatch ? 25 : 0));

        if (strength < 25) return null;

        return {
          relation: KnowledgeRelation.create({
            sourceRecordId: input.source.id,
            targetRecordId: candidate.id,
            relationType,
            strength,
          }),
          reason:
            overlap.length > 0
              ? `Shared tags: ${overlap.join(", ")}`
              : `Same domain: ${input.source.domain}`,
        };
      })
      .filter((item): item is ResolvedRelation => item !== null);
  }

  findRelated(record: KnowledgeRecord, allRecords: KnowledgeRecord[]): KnowledgeRecord[] {
    return this.resolve({ source: record, candidates: allRecords })
      .map((resolved) =>
        allRecords.find((candidate) => candidate.id === resolved.relation.targetRecordId),
      )
      .filter((item): item is KnowledgeRecord => item !== undefined);
  }
}
