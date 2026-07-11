import type {
  KnowledgeNode,
  KnowledgeNodeId,
  KnowledgeRelation,
  KnowledgeRelationId,
} from "./knowledge.types";

export interface KnowledgeRepository {
  saveNode(node: KnowledgeNode): Promise<void>;
  saveRelation(relation: KnowledgeRelation): Promise<void>;
  findNodeById(id: KnowledgeNodeId): Promise<KnowledgeNode | null>;
  findNodes(): Promise<KnowledgeNode[]>;
  findRelations(): Promise<KnowledgeRelation[]>;
  deleteByCompany(companyId: string): Promise<void>;
}

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  private readonly nodes = new Map<KnowledgeNodeId, KnowledgeNode>();
  private readonly relations = new Map<KnowledgeRelationId, KnowledgeRelation>();

  saveNode(node: KnowledgeNode): Promise<void> {
    this.nodes.set(node.id, structuredClone(node));
    return Promise.resolve();
  }

  saveRelation(relation: KnowledgeRelation): Promise<void> {
    this.relations.set(relation.id, structuredClone(relation));
    return Promise.resolve();
  }

  findNodeById(id: KnowledgeNodeId): Promise<KnowledgeNode | null> {
    const node = this.nodes.get(id);
    return Promise.resolve(node ? structuredClone(node) : null);
  }

  findNodes(): Promise<KnowledgeNode[]> {
    return Promise.resolve([...this.nodes.values()].map((node) => structuredClone(node)));
  }

  findRelations(): Promise<KnowledgeRelation[]> {
    return Promise.resolve([...this.relations.values()].map((relation) => structuredClone(relation)));
  }

  deleteByCompany(companyId: string): Promise<void> {
    for (const [id, node] of this.nodes.entries()) {
      if (node.companyId === companyId) {
        this.nodes.delete(id);
      }
    }

    for (const [id, relation] of this.relations.entries()) {
      const fromNode = this.nodes.get(relation.from);
      const toNode = this.nodes.get(relation.to);
      if (!fromNode || !toNode) {
        this.relations.delete(id);
      }
    }

    return Promise.resolve();
  }
}

let defaultRepository: InMemoryKnowledgeRepository | null = null;

export function getDefaultKnowledgeRepository(): InMemoryKnowledgeRepository {
  if (!defaultRepository) {
    defaultRepository = new InMemoryKnowledgeRepository();
  }
  return defaultRepository;
}
