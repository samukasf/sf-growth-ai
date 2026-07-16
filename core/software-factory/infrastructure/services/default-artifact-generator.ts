import {
  GeneratedArtifact,
  type ArtifactGenerator,
  type GenerateArtifactsInput,
} from "../../domain";

const NAVIGABLE_PROJECT_TYPES = new Set([
  "website",
  "landing_page",
  "crm",
  "erp",
  "dashboard",
  "mobile_app",
  "customer_portal",
  "employee_portal",
  "internal_system",
]);

export class DefaultArtifactGenerator implements ArtifactGenerator {
  generate(input: GenerateArtifactsInput): GeneratedArtifact[] {
    const { project, architecture } = input;
    const artifacts = [
      GeneratedArtifact.create({
        projectId: project.id,
        kind: "source_blueprint",
        name: "Solution Blueprint",
        description: "Mapa estrutural da solução planejada.",
        contentsSummary: `Arquitetura ${architecture.style} com ${architecture.modules.length} módulos.`,
      }),
      GeneratedArtifact.create({
        projectId: project.id,
        kind: "api_contract",
        name: "API Contract Plan",
        description: "Contratos de integração previstos.",
        contentsSummary: "Endpoints, eventos e contratos externos planejados.",
      }),
      GeneratedArtifact.create({
        projectId: project.id,
        kind: "ui_map",
        name: "UI Map",
        description: "Estrutura de telas e fluxos principais.",
        contentsSummary: "Mapa de jornadas, telas e componentes-chave.",
      }),
    ];

    if (NAVIGABLE_PROJECT_TYPES.has(project.projectType)) {
      artifacts.push(
        GeneratedArtifact.create({
          projectId: project.id,
          kind: "navigable_preview",
          name: "Navigable Product Preview",
          description: "Preview HTML navegável para validar a experiência antes do deploy.",
          contentsSummary: [
            `Preview navegável para ${project.title}.`,
            "Inclui telas, seções, estados principais e canais de conversão.",
            "Compatível com painel isolado por iframe/srcDoc.",
          ].join(" "),
        }),
        GeneratedArtifact.create({
          projectId: project.id,
          kind: "handoff_package",
          name: "Product Handoff Package",
          description: "Pacote de entrega com preview, estrutura funcional e checklist de publicação.",
          contentsSummary: "index.html, mapa de conteúdo, fluxos, CTAs, metadados e checklist de deploy.",
        }),
      );
    }

    return artifacts;
  }
}
