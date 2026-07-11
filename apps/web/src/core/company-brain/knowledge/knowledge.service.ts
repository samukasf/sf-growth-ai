import type { CompanyBrain, DiscoveryResult } from "../company-brain.types";
import { buildKnowledgeGraphFromCompanyBrain } from "./knowledge.builder";
import { mapCreateNodeInput, mapCreateRelationInput } from "./knowledge.mapper";
import type { KnowledgeRepository } from "./knowledge.repository";
import { getDefaultKnowledgeRepository } from "./knowledge.repository";
import type {
  CreateKnowledgeNodeInput,
  CreateKnowledgeRelationInput,
  KnowledgeGraph,
  KnowledgeGraphFilter,
  KnowledgeGraphSummary,
  KnowledgeNode,
  KnowledgeNodeId,
  KnowledgeRelation,
  KnowledgeRelationType,
  UpdateKnowledgeNodeInput,
} from "./knowledge.types";

function matchesArrayFilter<T>(value: T, filter?: T | T[]): boolean {
  if (!filter) return true;
  return Array.isArray(filter) ? filter.includes(value) : value === filter;
}

export class KnowledgeService {
  constructor(private readonly repository: KnowledgeRepository) {}

  async createNode(input: CreateKnowledgeNodeInput): Promise<KnowledgeNode> {
    const node = mapCreateNodeInput(input);
    await this.repository.saveNode(node);
    return node;
  }

  async updateNode(input: UpdateKnowledgeNodeInput): Promise<KnowledgeNode> {
    const existing = await this.repository.findNodeById(input.id);
    if (!existing) {
      throw new Error(`Knowledge node not found: ${input.id}`);
    }

    const updated: KnowledgeNode = {
      ...existing,
      name: input.name?.trim() ?? existing.name,
      description: input.description?.trim() ?? existing.description,
      metadata: input.metadata ? { ...existing.metadata, ...input.metadata } : existing.metadata,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.saveNode(updated);
    return updated;
  }

  async createRelation(input: CreateKnowledgeRelationInput): Promise<KnowledgeRelation> {
    const [fromNode, toNode] = await Promise.all([
      this.repository.findNodeById(input.from),
      this.repository.findNodeById(input.to),
    ]);

    if (!fromNode || !toNode) {
      throw new Error("Both source and target nodes must exist before creating a relation.");
    }

    const relation = mapCreateRelationInput(input);
    await this.repository.saveRelation(relation);
    return relation;
  }

  async findNode(id: KnowledgeNodeId): Promise<KnowledgeNode | null> {
    return this.repository.findNodeById(id);
  }

  async findRelations(filter: KnowledgeGraphFilter = {}): Promise<KnowledgeRelation[]> {
    const relations = await this.repository.findRelations();
    const nodes = await this.repository.findNodes();
    const nodeIndex = new Map(nodes.map((node) => [node.id, node]));

    return relations.filter((relation) => {
      const fromNode = nodeIndex.get(relation.from);
      const toNode = nodeIndex.get(relation.to);
      if (!fromNode || !toNode) return false;
      if (filter.tenantId && fromNode.tenantId !== filter.tenantId) return false;
      if (filter.companyId && fromNode.companyId !== filter.companyId) return false;
      if (!matchesArrayFilter(relation.relation, filter.relationType)) return false;
      return true;
    });
  }

  async findNeighbors(nodeId: KnowledgeNodeId): Promise<{
    node: KnowledgeNode;
    neighbors: Array<{ node: KnowledgeNode; relation: KnowledgeRelationType; direction: "out" | "in" }>;
  } | null> {
    const node = await this.repository.findNodeById(nodeId);
    if (!node) return null;

    const relations = await this.repository.findRelations();
    const nodes = await this.repository.findNodes();
    const nodeIndex = new Map(nodes.map((item) => [item.id, item]));

    const neighbors: Array<{
      node: KnowledgeNode;
      relation: KnowledgeRelationType;
      direction: "out" | "in";
    }> = [];

    for (const rel of relations) {
      if (rel.from === nodeId) {
        const target = nodeIndex.get(rel.to);
        if (target) {
          neighbors.push({ node: target, relation: rel.relation, direction: "out" });
        }
      }
      if (rel.to === nodeId) {
        const source = nodeIndex.get(rel.from);
        if (source) {
          neighbors.push({ node: source, relation: rel.relation, direction: "in" });
        }
      }
    }

    return { node, neighbors };
  }

  async buildGraph(filter: KnowledgeGraphFilter = {}): Promise<KnowledgeGraph> {
    const nodes = await this.listNodes(filter);
    const relations = await this.findRelations(filter);

    const tenantId = filter.tenantId ?? nodes[0]?.tenantId ?? "";
    const companyId = filter.companyId ?? nodes[0]?.companyId ?? "";

    return {
      tenantId,
      companyId,
      nodes,
      relations,
      builtAt: new Date().toISOString(),
    };
  }

  async summarize(filter: KnowledgeGraphFilter = {}): Promise<KnowledgeGraphSummary> {
    const graph = await this.buildGraph(filter);
    return this.buildSummary(graph.nodes, graph.relations);
  }

  async seedFromCompanyBrain(
    brain: CompanyBrain,
    discovery?: DiscoveryResult,
  ): Promise<KnowledgeGraph> {
    const graph = buildKnowledgeGraphFromCompanyBrain(brain, discovery);

    for (const node of graph.nodes) {
      await this.repository.saveNode(node);
    }

    for (const relation of graph.relations) {
      await this.repository.saveRelation(relation);
    }

    return graph;
  }

  private async listNodes(filter: KnowledgeGraphFilter = {}): Promise<KnowledgeNode[]> {
    const nodes = await this.repository.findNodes();

    return nodes.filter((node) => {
      if (filter.tenantId && node.tenantId !== filter.tenantId) return false;
      if (filter.companyId && node.companyId !== filter.companyId) return false;
      if (!matchesArrayFilter(node.type, filter.nodeType)) return false;
      return true;
    });
  }

  private buildSummary(
    nodes: KnowledgeNode[],
    relations: KnowledgeRelation[],
  ): KnowledgeGraphSummary {
    const nodesByType: KnowledgeGraphSummary["nodesByType"] = {};
    const relationsByType: KnowledgeGraphSummary["relationsByType"] = {};
    const connectionCount = new Map<string, number>();

    for (const node of nodes) {
      nodesByType[node.type] = (nodesByType[node.type] ?? 0) + 1;
    }

    for (const relation of relations) {
      relationsByType[relation.relation] = (relationsByType[relation.relation] ?? 0) + 1;
      connectionCount.set(relation.from, (connectionCount.get(relation.from) ?? 0) + 1);
      connectionCount.set(relation.to, (connectionCount.get(relation.to) ?? 0) + 1);
    }

    const nodeIndex = new Map(nodes.map((node) => [node.id, node]));
    const topConnectedNodes = [...connectionCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, connections]) => {
        const node = nodeIndex.get(id)!;
        return {
          id,
          name: node.name,
          type: node.type,
          connections,
        };
      });

    const headline =
      nodes.length === 0
        ? "Knowledge Graph vazio."
        : `${nodes.length} entidades · ${relations.length} relações mapeadas`;

    const highlights = topConnectedNodes.slice(0, 3).map(
      (item) => `${item.name} (${item.type}) — ${item.connections} conexões`,
    );

    if (nodesByType.opportunity) {
      highlights.push(`${nodesByType.opportunity} oportunidade(s) conectadas ao grafo.`);
    }

    return {
      nodeCount: nodes.length,
      relationCount: relations.length,
      nodesByType,
      relationsByType,
      topConnectedNodes,
      headline,
      highlights: highlights.slice(0, 4),
    };
  }
}

let defaultService: KnowledgeService | null = null;

export function getKnowledgeService(): KnowledgeService {
  if (!defaultService) {
    defaultService = new KnowledgeService(getDefaultKnowledgeRepository());
  }
  return defaultService;
}
