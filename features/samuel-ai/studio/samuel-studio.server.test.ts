import { describe, expect, it } from "vitest";

import {
  buildStudioPrompt,
  parseGeneratedStudioProject,
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

  it("valida o brief e instrui uma geração isolada", () => {
    const request = validateStudioRequest({ type: "app", brief: "Aplicativo executivo para organizar clientes" });
    const prompt = buildStudioPrompt(request);
    expect(prompt).toContain("aplicativo web responsivo");
    expect(prompt).toContain("não use fetch");
  });
});
