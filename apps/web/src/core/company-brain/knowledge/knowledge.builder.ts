import type { CompanyBrain, DiscoveryResult } from "../company-brain.types";
import type {
  CreateKnowledgeNodeInput,
  CreateKnowledgeRelationInput,
  KnowledgeGraph,
  KnowledgeNodeType,
  KnowledgeRelationType,
} from "./knowledge.types";
import { mapCreateNodeInput, mapCreateRelationInput } from "./knowledge.mapper";

type BuiltEntities = {
  nodes: CreateKnowledgeNodeInput[];
  relations: CreateKnowledgeRelationInput[];
};

function nodeId(type: KnowledgeNodeType, slug: string) {
  return `kn-${type}-${slug}`;
}

function relation(
  from: string,
  to: string,
  relationType: KnowledgeRelationType,
  weight = 0.8,
  confidence = 75,
): CreateKnowledgeRelationInput {
  return { from, to, relation: relationType, weight, confidence };
}

export function buildKnowledgeEntitiesFromCompanyBrain(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): BuiltEntities {
  const tenantId = brain.organizationId;
  const companyId = brain.companyId;
  const companyNodeId = nodeId("company", brain.companyId);

  const nodes: CreateKnowledgeNodeInput[] = [
    {
      id: companyNodeId,
      tenantId,
      companyId,
      type: "company",
      name: brain.companyName,
      description: brain.companyProfile.description ?? brain.mission,
      metadata: {
        industry: brain.companyProfile.industry ?? null,
        completenessScore: brain.completenessScore,
      },
    },
  ];

  const relations: CreateKnowledgeRelationInput[] = [];

  for (const product of brain.products) {
    const id = nodeId("product", product.toLowerCase().replace(/\s+/g, "-"));
    nodes.push({
      id,
      tenantId,
      companyId,
      type: "product",
      name: product,
      description: `Produto oferecido por ${brain.companyName}.`,
      metadata: { source: "company-brain" },
    });
    relations.push(relation(companyNodeId, id, "OWNS", 1, 90));
    relations.push(relation(companyNodeId, id, "SELLS", 0.9, 85));
  }

  for (const service of brain.services) {
    const id = nodeId("service", service.toLowerCase().replace(/\s+/g, "-"));
    nodes.push({
      id,
      tenantId,
      companyId,
      type: "service",
      name: service,
      description: `Serviço oferecido por ${brain.companyName}.`,
      metadata: { source: "company-brain" },
    });
    relations.push(relation(companyNodeId, id, "OWNS", 1, 88));
    relations.push(relation(companyNodeId, id, "SELLS", 0.85, 82));
  }

  for (const audience of brain.targetAudience) {
    const id = nodeId("customer", audience.toLowerCase().replace(/\s+/g, "-"));
    nodes.push({
      id,
      tenantId,
      companyId,
      type: "customer",
      name: audience,
      description: "Segmento de clientes identificado no discovery.",
      metadata: { source: "company-brain" },
    });
    relations.push(relation(companyNodeId, id, "SELLS", 0.75, 70));
    relations.push(relation(id, companyNodeId, "BUYS", 0.7, 68));
  }

  for (const competitor of brain.competitors) {
    const id = nodeId("competitor", competitor.toLowerCase().replace(/\s+/g, "-"));
    nodes.push({
      id,
      tenantId,
      companyId,
      type: "competitor",
      name: competitor,
      description: "Concorrente mapeado no perfil comercial.",
      metadata: { source: "company-brain" },
    });
    relations.push(relation(companyNodeId, id, "COMPETES_WITH", 0.8, 72));
  }

  for (const goal of brain.businessGoals) {
    const id = nodeId("goal", goal.toLowerCase().slice(0, 24).replace(/\s+/g, "-"));
    nodes.push({
      id,
      tenantId,
      companyId,
      type: "goal",
      name: goal,
      description: "Objetivo estratégico da empresa.",
      metadata: { source: "company-brain" },
    });
    relations.push(relation(companyNodeId, id, "SUPPORTS", 0.85, 80));
    relations.push(relation(id, companyNodeId, "RELATED_TO", 0.7, 75));
  }

  for (const risk of brain.openRisks) {
    const id = nodeId("risk", risk.toLowerCase().slice(0, 24).replace(/\s+/g, "-"));
    nodes.push({
      id,
      tenantId,
      companyId,
      type: "risk",
      name: risk.split(":")[0] ?? risk,
      description: risk,
      metadata: { source: "company-brain" },
    });
    relations.push(relation(id, companyNodeId, "BLOCKS", 0.7, 65));
    relations.push(relation(companyNodeId, id, "RELATED_TO", 0.6, 60));
  }

  for (const opportunity of brain.growthOpportunities) {
    const id = nodeId("opportunity", opportunity.toLowerCase().slice(0, 24).replace(/\s+/g, "-"));
    nodes.push({
      id,
      tenantId,
      companyId,
      type: "opportunity",
      name: opportunity.split("—")[0]?.trim() ?? opportunity,
      description: opportunity,
      metadata: { source: "company-brain" },
    });
    relations.push(relation(companyNodeId, id, "GENERATES", 0.8, 78));
    relations.push(relation(id, companyNodeId, "SUPPORTS", 0.75, 76));
  }

  const channels = discovery?.profile.sections
    .find((section) => section.key === "commercial")
    ?.data?.channels;

  if (Array.isArray(channels)) {
    for (const channel of channels) {
      if (typeof channel !== "string") continue;
      const id = nodeId("channel", channel.toLowerCase().replace(/\s+/g, "-"));
      nodes.push({
        id,
        tenantId,
        companyId,
        type: "channel",
        name: channel,
        description: "Canal comercial identificado no discovery.",
        metadata: { source: "discovery" },
      });
      relations.push(relation(companyNodeId, id, "USES", 0.75, 70));
      relations.push(relation(id, companyNodeId, "SUPPORTS", 0.65, 68));
    }
  }

  if (discovery) {
    nodes.push({
      id: nodeId("document", discovery.session.id),
      tenantId,
      companyId,
      type: "document",
      name: `Discovery ${discovery.session.id}`,
      description: discovery.report.summary,
      metadata: {
        sessionId: discovery.session.id,
        completeness: discovery.profile.completenessScore,
      },
    });
    relations.push(
      relation(companyNodeId, nodeId("document", discovery.session.id), "USES", 0.9, 88),
    );
    relations.push(
      relation(nodeId("document", discovery.session.id), companyNodeId, "GENERATES", 0.85, 86),
    );
  }

  const projectId = nodeId("project", "company-brain");
  nodes.push({
    id: projectId,
    tenantId,
    companyId,
    type: "project",
    name: "Company Brain",
    description: "Projeto de consolidação do conhecimento empresarial.",
    metadata: { brainId: brain.id },
  });
  relations.push(relation(companyNodeId, projectId, "OWNS", 1, 92));
  relations.push(relation(projectId, companyNodeId, "IMPLEMENTS", 0.9, 90));

  return { nodes, relations };
}

export function buildKnowledgeGraphFromCompanyBrain(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): KnowledgeGraph {
  const built = buildKnowledgeEntitiesFromCompanyBrain(brain, discovery);

  return {
    tenantId: brain.organizationId,
    companyId: brain.companyId,
    nodes: built.nodes.map(mapCreateNodeInput),
    relations: built.relations.map(mapCreateRelationInput),
    builtAt: new Date().toISOString(),
  };
}
