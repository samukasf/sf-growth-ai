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

  it.each([
    ["abra a pasta Downloads", "shell:Downloads"],
    ["abrir meus documentos", "shell:Personal"],
    ["abra a área de trabalho", "shell:Desktop"],
    ["abra minhas fotos", "shell:PicturesLibrary"],
    ["abra vídeos", "shell:VideosLibrary"],
    ["abra músicas", "shell:MusicLibrary"],
    ["abra este computador", "shell:MyComputerFolder"],
  ])("abre pastas comuns do Windows diretamente: %s", (goal, shellTarget) => {
    expect(resolveDirectDesktopCommand(goal)).toEqual({
      action: "system.app.open",
      args: { file: "explorer.exe", args: [shellTarget] },
      risk: "mutate",
    });
  });

  it("mantém tarefas compostas ou pastas arbitrárias no fluxo visual", () => {
    expect(resolveDirectDesktopCommand("Digite o orçamento no Word")).toBeNull();
    expect(resolveDirectDesktopCommand("Faça uma pesquisa no computador")).toBeNull();
    expect(resolveDirectDesktopCommand("abra a pasta do cliente XPTO")).toBeNull();
  });
});
