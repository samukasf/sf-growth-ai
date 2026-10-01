import { describe, expect, it, vi } from "vitest";

import { searchSamuelMusicCatalog } from "./samuel-music-catalog.server";

describe("Samuel music catalog", () => {
  it("normalizes playable tracks from the public catalog", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              trackId: 42,
              trackName: "Exemplo",
              artistName: "Artista",
              collectionName: "Álbum",
              artworkUrl100: "https://example.com/100x100bb.jpg",
              previewUrl: "https://audio.example.com/preview.m4a",
              trackViewUrl: "https://music.example.com/track",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    ) as unknown as typeof fetch;

    const result = await searchSamuelMusicCatalog({
      query: "Exemplo Artista",
      fetcher,
    });

    expect(result.provider).toBe("itunes-preview");
    expect(result.tracks[0]).toMatchObject({
      id: "42",
      title: "Exemplo",
      artist: "Artista",
    });
    expect(result.tracks[0]?.artworkUrl).toContain("300x300bb");
  });
});
