import { describe, expect, it } from "vitest";

import {
  ArchitectureBlueprint,
  BusinessRequirements,
  FunctionalRequirements,
  SoftwareProject,
  SoftwareSpecification,
  TechnicalRequirements,
} from "../../domain";
import { DefaultArtifactGenerator } from "./default-artifact-generator";

function createProject(projectType: "website" | "dashboard") {
  return SoftwareProject.create({
    id: `project-${projectType}`,
    organizationId: "org-1",
    companyId: "company-1",
    projectType,
    title: projectType === "website" ? "Site Grafgil" : "Painel Grafgil",
    description: "Projeto gerado pelo Samuel AI.",
    businessProblem: "Precisa de entrega navegável.",
    businessGoals: ["Publicar experiência utilizável"],
    functionalRequirements: ["Preview navegável"],
    technicalRequirements: ["Next.js"],
    architecture: "modular",
    estimatedCost: 1000,
    estimatedTime: 7,
    estimatedROI: 5000,
    priority: "high",
  });
}

const businessRequirements = BusinessRequirements.create({
  id: "business-1",
  projectId: "project-website",
  problemStatement: "Problem",
  goals: [],
  stakeholders: [],
});

const functionalRequirements = FunctionalRequirements.create({
  id: "functional-1",
  projectId: "project-website",
  items: [],
  userFlows: [],
  integrations: [],
});

const technicalRequirements = TechnicalRequirements.create({
  id: "technical-1",
  projectId: "project-website",
  stackPreferences: [],
  constraints: [],
  securityRequirements: [],
  nonFunctionalRequirements: [],
});

const architecture = ArchitectureBlueprint.create({
  id: "architecture-1",
  projectId: "project-website",
  style: "modular-monolith",
  layers: ["presentation", "application"],
  dataStrategy: "static content",
  modules: [],
});

const specification = SoftwareSpecification.create({
  id: "specification-1",
  projectId: "project-website",
  summary: "Spec",
  businessRequirements: businessRequirements.toJSON(),
  functionalRequirements: functionalRequirements.toJSON(),
  technicalRequirements: technicalRequirements.toJSON(),
});

describe("DefaultArtifactGenerator", () => {
  it("adds a navigable preview and handoff package for website projects", () => {
    const artifacts = new DefaultArtifactGenerator().generate({
      project: createProject("website"),
      architecture,
      specification,
    });

    expect(artifacts.map((artifact) => artifact.kind)).toEqual([
      "source_blueprint",
      "api_contract",
      "ui_map",
      "navigable_preview",
      "handoff_package",
    ]);
    expect(artifacts.at(-2)?.contentsSummary).toContain("Preview navegável");
  });

  it("keeps non-website projects on the standard artifact contract", () => {
    const artifacts = new DefaultArtifactGenerator().generate({
      project: createProject("dashboard"),
      architecture,
      specification,
    });

    expect(artifacts.map((artifact) => artifact.kind)).toEqual([
      "source_blueprint",
      "api_contract",
      "ui_map",
    ]);
  });
});
