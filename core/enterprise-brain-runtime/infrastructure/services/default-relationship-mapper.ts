import { EnterpriseBrainRelationship } from "../../domain";
import type { EnterpriseBrainRelationshipMapper } from "../../domain/ports/relationship-mapper.port";
import type { DataSourceContribution } from "../../domain/ports/brain-repository.port";

const DOMAIN_LINKS: Array<[string, string, string]> = [
  ["enterprise_memory", "executive_knowledge", "feeds"],
  ["executive_knowledge", "executive_learning", "informs"],
  ["executive_learning", "executive_experience", "validates"],
  ["executive_experience", "executive_wisdom", "distills"],
  ["organization", "company", "governs"],
  ["company", "departments", "contains"],
  ["departments", "projects", "executes"],
  ["crm", "communication", "engages"],
  ["automation", "commerce", "accelerates"],
  ["scheduling", "projects", "coordinates"],
];

export class DefaultEnterpriseBrainRelationshipMapper implements EnterpriseBrainRelationshipMapper {
  map(contributions: DataSourceContribution[]) {
    const available = new Set(
      contributions.filter((c) => c.available).map((c) => c.source),
    );

    return DOMAIN_LINKS.filter(
      ([source, target]) => available.has(source) && available.has(target),
    ).map(([source, target, type]) =>
      EnterpriseBrainRelationship.create({
        sourceDomain: source,
        targetDomain: target,
        relationshipType: type,
        strength: 75,
        label: `${source} → ${target}`,
      }),
    );
  }
}
