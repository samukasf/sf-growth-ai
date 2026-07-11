import { describe, expect, it } from "vitest";

import { extractEntities } from "./entity-extractor";

describe("extractEntities", () => {
  it("extrai números e ignora a primeira palavra da frase", () => {
    expect(extractEntities("Quanto é 856 × 347?")).toEqual(["856", "347"]);
  });

  it("extrai siglas/nomes próprios que não estão no início da frase", () => {
    expect(extractEntities("Explique SEO e aplique na minha empresa.")).toEqual(["SEO"]);
  });

  it("não repete a mesma entidade duas vezes", () => {
    expect(extractEntities("SEO é importante. SEO ajuda muito.")).toEqual(["SEO"]);
  });

  it("devolve array vazio quando não há entidades reconhecíveis", () => {
    expect(extractEntities("Analise minha empresa")).toEqual([]);
  });

  it("devolve array vazio para texto vazio", () => {
    expect(extractEntities("   ")).toEqual([]);
  });

  it("extrai percentuais", () => {
    expect(extractEntities("Minha margem caiu 12,5% este mês.")).toContain("12,5%");
  });
});
