import {
  GeneratedArtifact,
  type ArtifactGenerator,
  type GenerateArtifactsInput,
} from "../../domain";

export class DefaultArtifactGenerator implements ArtifactGenerator {
  generate(input: GenerateArtifactsInput): GeneratedArtifact[] {
    const { project, architecture } = input;
    return [
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
  }
}

