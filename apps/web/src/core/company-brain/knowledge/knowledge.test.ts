import { describe, expect, it } from "vitest";

import { buildCompanyBrain } from "../company-brain.builder";
import { createSampleDiscoveryResult } from "../company-brain.fixture";
import {
  buildKnowledgeGraphFromCompanyBrain,
  InMemoryKnowledgeRepository,
  KnowledgeService,
  presentKnowledgeGraph,
} from "./index";

describe("KnowledgeService", () => {
  it("creates, updates nodes and relations", async () => {
    const service = new KnowledgeService(new InMemoryKnowledgeRepository());

    const company = await service.createNode({
      tenantId: "org-1",
      companyId: "company-1",
      type: "company",
      name: "Acme Labs",
      description: "Empresa principal",
      metadata: {},
    });

    const product = await service.createNode({
      tenantId: "org-1",
      companyId: "company-1",
      type: "product",
      name: "Growth OS",
      description: "Produto flagship",
      metadata: {},
    });

    const relation = await service.createRelation({
      from: company.id,
      to: product.id,
      relation: "OWNS",
      weight: 1,
      confidence: 90,
    });

    expect(relation.relation).toBe("OWNS");

    const updated = await service.updateNode({
      id: product.id,
      name: "Growth OS Pro",
    });

    expect(updated.name).toBe("Growth OS Pro");
    expect(updated.updatedAt >= product.updatedAt).toBe(true);
  });

  it("finds nodes, relations and neighbors", async () => {
    const service = new KnowledgeService(new InMemoryKnowledgeRepository());

    const company = await service.createNode({
      tenantId: "org-1",
      companyId: "company-1",
      type: "company",
      name: "Acme",
      description: "Empresa",
      metadata: {},
    });

    const partner = await service.createNode({
      tenantId: "org-1",
      companyId: "company-1",
      type: "partner",
      name: "Partner Co",
      description: "Parceiro estratégico",
      metadata: {},
    });

    await service.createRelation({
      from: company.id,
      to: partner.id,
      relation: "WORKS_WITH",
      weight: 0.8,
      confidence: 75,
    });

    const found = await service.findNode(company.id);
    expect(found?.name).toBe("Acme");

    const relations = await service.findRelations({ companyId: "company-1" });
    expect(relations).toHaveLength(1);

    const neighbors = await service.findNeighbors(company.id);
    expect(neighbors?.neighbors).toHaveLength(1);
    expect(neighbors?.neighbors[0]?.node.name).toBe("Partner Co");
  });

  it("builds graph and summarizes from company brain", async () => {
    const discovery = createSampleDiscoveryResult();
    const brain = buildCompanyBrain(discovery);
    const service = new KnowledgeService(new InMemoryKnowledgeRepository());

    const graph = await service.seedFromCompanyBrain(brain, discovery);
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.relations.length).toBeGreaterThan(0);
    expect(graph.nodes.some((node) => node.type === "company")).toBe(true);
    expect(graph.nodes.some((node) => node.type === "product")).toBe(true);
    expect(graph.nodes.some((node) => node.type === "competitor")).toBe(true);

    const built = buildKnowledgeGraphFromCompanyBrain(brain, discovery);
    expect(built.nodes.length).toBe(graph.nodes.length);

    const summary = await service.summarize({
      tenantId: brain.organizationId,
      companyId: brain.companyId,
    });

    expect(summary.nodeCount).toBeGreaterThan(0);
    expect(summary.relationCount).toBeGreaterThan(0);
    expect(summary.headline).toContain("entidades");

    const presentation = presentKnowledgeGraph(graph, summary);
    expect(presentation.nodesByType.length).toBeGreaterThan(0);
    expect(presentation.relations.length).toBeGreaterThan(0);
  });
});
