import { describe, expect, it } from "vitest";

import { parseSamuelMusicCommand } from "./samuel-music.server";

describe("Samuel music command parser", () => {
  it("understands natural Portuguese play commands", () => {
    expect(parseSamuelMusicCommand("Samuel, toca Evidências do Chitãozinho e Xororó")).toEqual({
      action: "play",
      query: "evidencias do chitaozinho e xororo",
    });
    expect(parseSamuelMusicCommand("coloque música relaxante para trabalhar")).toEqual({
      action: "play",
      query: "relaxante para trabalhar",
    });
  });

  it("understands transport and volume controls", () => {
    expect(parseSamuelMusicCommand("pause a música")).toEqual({ action: "pause" });
    expect(parseSamuelMusicCommand("próxima música")).toEqual({ action: "next" });
    expect(parseSamuelMusicCommand("volume 35")).toEqual({
      action: "set_volume",
      volume: 35,
    });
    expect(parseSamuelMusicCommand("abaixa o volume")).toEqual({
      action: "volume_down",
    });
  });

  it("ignores unrelated requests", () => {
    expect(parseSamuelMusicCommand("faça um vídeo para o Instagram")).toBeNull();
  });
});
