import { describe, expect, it } from "vitest";

import { resolveDirectDesktopCommand } from "./samuel-desktop-direct-command";

describe("resolveDirectDesktopCommand", () => {
  it("abre aplicativos conhecidos sem depender de computer use", () => {
    expect(resolveDirectDesktopCommand("Abra calculadora no meu computador")).toEqual({
      action: "system.app.open",
      args: { file: "calc.exe" },
      risk: "mutate",
    });
    expect(resolveDirectDesktopCommand("abrir o bloco de notas no PC")?.args).toEqual({
      file: "notepad.exe",
    });
  });

  it("mantém tarefas compostas no fluxo visual", () => {
    expect(resolveDirectDesktopCommand("Digite o orçamento no Word")).toBeNull();
    expect(resolveDirectDesktopCommand("Faça uma pesquisa no computador")).toBeNull();
  });
});
