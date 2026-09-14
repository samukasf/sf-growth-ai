import { describe, expect, it } from "vitest";

import {
  contentRequestFromQuery,
  createFallbackContentProject,
  isContentCreationRequest,
  validateContentRequest,
} from "./samuel-content.server";

describe("Samuel Content Studio", () => {
  it("identifica pedidos de conteúdo em português", () => {
    expect(isContentCreationRequest("Faça um vídeo sobre meu produto e poste no Instagram")).toBe(true);
    expect(isContentCreationRequest("qual foi o faturamento deste mês?")).toBe(false);
  });

  it("extrai formato e redes de um comando do chat", () => {
    const request = contentRequestFromQuery("Crie um vídeo para Instagram, TikTok e YouTube Shorts");
    expect(request.format).toBe("video");
    expect(request.aspectRatio).toBe("9:16");
    expect(request.platforms).toEqual(["instagram", "youtube", "tiktok"]);
  });

  it("gera campanha-base completa e somente para redes selecionadas", () => {
    const input = validateContentRequest({ brief: "Apresente o produto de automação para pequenas empresas", format: "post", platforms: ["facebook", "linkedin"] });
    const project = createFallbackContentProject(input);
    expect(project.format).toBe("post");
    expect(project.scenes.length).toBeGreaterThanOrEqual(3);
    expect(project.socialCopies.map((copy) => copy.platform)).toEqual(["facebook", "linkedin"]);
    expect(project.script.length).toBeGreaterThan(40);
  });
});
