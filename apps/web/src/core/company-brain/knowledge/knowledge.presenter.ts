import type {
  KnowledgeGraph,
  KnowledgeGraphPresentation,
  KnowledgeGraphSummary,
  KnowledgeNode,
  KnowledgeNodeType,
} from "./knowledge.types";
import { KNOWLEDGE_NODE_TYPE_LABELS } from "./knowledge.types";
import { mapNodeToView, mapRelationToView } from "./knowledge.mapper";
import type { KnowledgeService } from "./knowledge.service";

export function presentKnowledgeGraph(
  graph: KnowledgeGraph,
  summary: KnowledgeGraphSummary,
): KnowledgeGraphPresentation {
  const nodeIndex = new Map(graph.nodes.map((node) => [node.id, node]));
  const typeOrder = Object.keys(KNOWLEDGE_NODE_TYPE_LABELS) as KnowledgeNodeType[];

  const nodesByType = typeOrder
    .map((type) => ({
      type,
      label: KNOWLEDGE_NODE_TYPE_LABELS[type],
      nodes: graph.nodes.filter((node) => node.type === type).map(mapNodeToView),
    }))
    .filter((group) => group.nodes.length > 0);

  const relations = graph.relations.map((relation) =>
    mapRelationToView(relation, nodeIndex),
  );

  const neighbors = summary.topConnectedNodes.slice(0, 3).map((item) => {
    const node = nodeIndex.get(item.id);
    if (!node) {
      return null;
    }

    const relatedIds = graph.relations
      .filter((relation) => relation.from === item.id || relation.to === item.id)
      .map((relation) => (relation.from === item.id ? relation.to : relation.from));

    const related = [...new Set(relatedIds)]
      .map((id) => nodeIndex.get(id))
      .filter((value): value is KnowledgeNode => Boolean(value))
      .slice(0, 4);

    const primaryRelation =
      graph.relations.find(
        (relation) => relation.from === item.id || relation.to === item.id,
      )?.relation ?? "RELATED_TO";

    return {
      node: mapNodeToView(node),
      related: related.map(mapNodeToView),
      relation: primaryRelation,
    };
  }).filter((value): value is NonNullable<typeof value> => Boolean(value));

  return {
    summary,
    nodesByType,
    relations,
    neighbors,
  };
}

export async function presentKnowledgeGraphForViewer(
  service: KnowledgeService,
  tenantId: string,
  companyId: string,
): Promise<KnowledgeGraphPresentation> {
  const graph = await service.buildGraph({ tenantId, companyId });
  const summary = await service.summarize({ tenantId, companyId });
  return presentKnowledgeGraph(graph, summary);
}
