import type {
  CreateKnowledgeNodeInput,
  CreateKnowledgeRelationInput,
  KnowledgeNode,
  KnowledgeRelation,
} from "./knowledge.types";

function createNodeId(type: string) {
  return `kn-${type}-${crypto.randomUUID()}`;
}

function createRelationId() {
  return `kr-${crypto.randomUUID()}`;
}

export function mapCreateNodeInput(input: CreateKnowledgeNodeInput): KnowledgeNode {
  const now = new Date().toISOString();

  return {
    id: input.id ?? createNodeId(input.type),
    tenantId: input.tenantId,
    companyId: input.companyId,
    type: input.type,
    name: input.name.trim(),
    description: input.description.trim(),
    metadata: { ...input.metadata },
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

export function mapCreateRelationInput(input: CreateKnowledgeRelationInput): KnowledgeRelation {
  return {
    id: input.id ?? createRelationId(),
    from: input.from,
    to: input.to,
    relation: input.relation,
    weight: clamp(input.weight, 0, 1),
    confidence: clamp(input.confidence, 0, 100),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function mapNodeToView(node: KnowledgeNode) {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    description: node.description,
    metadata: node.metadata,
  };
}

export function mapRelationToView(
  relation: KnowledgeRelation,
  nodeIndex: Map<string, KnowledgeNode>,
) {
  return {
    id: relation.id,
    from: relation.from,
    to: relation.to,
    fromName: nodeIndex.get(relation.from)?.name ?? relation.from,
    toName: nodeIndex.get(relation.to)?.name ?? relation.to,
    relation: relation.relation,
    weight: relation.weight,
    confidence: relation.confidence,
  };
}
