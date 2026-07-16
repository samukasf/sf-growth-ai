import { describe, expect, it } from "vitest";

import {
  buildStudioPrompt,
  parseGeneratedStudioProject,
  SAMUEL_STUDIO_TEXT_FORMAT,
  shouldRetryStudioWithoutSchema,
  studioFailureDiagnostic,
  validateStudioRequest,
} from "./samuel-studio.server";

const context = {
  id: "project-1",
  type: "site" as const,
  provider: "gateway",
  model: "gpt-oss",
  createdAt: "2026-07-16T10:00:00.000Z",
  fallbackName: "Projeto",
};

describe("Samuel Studio", () => {
  it("converte a resposta JSON do Gateway em projeto editável", () => {
    const project = parseGeneratedStudioProject(
      '```json\n{"name":"Site Alpha","summary":"Pronto","files":{"/App.js":"export default function App(){return <main>Alpha</main>}","/styles.css":"body{color:#fff}"}}\n```',
      context,
    );

    expect(project.name).toBe("Site Alpha");
    expect(project.files["/App.js"]).toContain('import "./styles.css"');
  });

  it("bloqueia código que tenta sair da prévia", () => {
    expect(() => parseGeneratedStudioProject(
      '{"name":"X","files":{"/App.js":"export default function App(){fetch(\'/secret\');return null}","/styles.css":"body{}"}}',
      context,
    )).toThrow(/capacidade externa/);
  });

  it("remove recursos externos do CSS sem descartar o projeto", () => {
    const project = parseGeneratedStudioProject(
      JSON.stringify({
        name: "Site seguro",
        summary: "Sem rede",
        files: {
          "/App.js": 'import "./styles.css"; export default function App(){return <main />}',
          "/styles.css": '@import url("https://fonts.example/font.css"); .hero{background-image:url(https://images.example/hero.jpg)}',
          "/data.js": "",
        },
      }),
      context,
    );

    expect(project.files["/styles.css"]).not.toContain("https://");
    expect(project.files["/styles.css"]).not.toContain("@import");
    expect(project.files["/styles.css"]).toContain("background-image:none");
  });

  it("valida o brief e instrui uma geração isolada", () => {
    const request = validateStudioRequest({ type: "app", brief: "Aplicativo executivo para organizar clientes" });
    const prompt = buildStudioPrompt(request);
    expect(prompt).toContain("aplicativo web responsivo");
    expect(prompt).toContain("não use fetch");
    expect(prompt).toContain("sempre devolva /data.js");
    expect(SAMUEL_STUDIO_TEXT_FORMAT.schema.required).toEqual(["name", "summary", "files"]);
  });

  it("remove credenciais e endereços do diagnóstico de fallback", () => {
    const diagnostic = studioFailureDiagnostic(
      new Error("Bearer segredo123 sk-projeto123 organization `org_privada` falhou em https://gateway.example/path"),
    );
    expect(diagnostic).toContain("[protegido]");
    expect(diagnostic).toContain("[chave protegida]");
    expect(diagnostic).toContain("[endereço protegido]");
    expect(diagnostic).not.toContain("segredo123");
    expect(diagnostic).not.toContain("org_privada");
  });

  it("só repete sem schema quando a falha pode ser de compatibilidade", () => {
    expect(shouldRetryStudioWithoutSchema(new Error("Unsupported parameter: text.format"))).toBe(true);
    expect(shouldRetryStudioWithoutSchema(new Error("Rate limit reached on tokens per minute"))).toBe(false);
    expect(shouldRetryStudioWithoutSchema(new Error("capacidade externa não permitida"))).toBe(false);
  });
});
