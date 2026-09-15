import { describe, expect, it } from "vitest";

import { isDesktopExecutionRequest } from "./samuel-desktop-command.client";

describe("isDesktopExecutionRequest", () => {
  it("detecta pedidos explícitos enviados pelo celular", () => {
    expect(isDesktopExecutionRequest("Abra o Chrome no meu computador e acesse o site")).toBe(true);
    expect(isDesktopExecutionRequest("Digite o orçamento no Word")).toBe(true);
  });

  it("não captura conversas sem alvo local explícito", () => {
    expect(isDesktopExecutionRequest("Crie um vídeo para o Instagram")).toBe(false);
    expect(isDesktopExecutionRequest("Como está a minha empresa?")) .toBe(false);
  });
});
