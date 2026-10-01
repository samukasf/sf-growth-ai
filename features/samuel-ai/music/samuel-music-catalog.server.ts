import type {
  SamuelMusicSearchResponse,
  SamuelMusicTrack,
} from "./samuel-music.types";

type ItunesResult = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
};

export async function searchSamuelMusicCatalog(input: {
  query: string;
  country?: string;
  fetcher?: typeof fetch;
  signal?: AbortSignal;
}): Promise<SamuelMusicSearchResponse> {
  const query = input.query.trim().slice(0, 180);
  if (query.length < 2) throw new Error("Diga qual música, artista ou estilo deseja ouvir.");

  const country = /^[A-Z]{2}$/i.test(input.country ?? "")
    ? String(input.country).toUpperCase()
    : "PT";
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", query);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "10");
  url.searchParams.set("country", country);
  url.searchParams.set("lang", "pt_pt");

  const response = await (input.fetcher ?? fetch)(url, {
    cache: "no-store",
    signal: input.signal,
  });
  if (!response.ok) {
    throw new Error(`Catálogo de música respondeu HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as { results?: ItunesResult[] };
  const tracks: SamuelMusicTrack[] = (payload.results ?? [])
    .filter(
      (item): item is Required<Pick<ItunesResult, "trackId" | "trackName" | "artistName" | "previewUrl">> & ItunesResult =>
        typeof item.trackId === "number" &&
        typeof item.trackName === "string" &&
        typeof item.artistName === "string" &&
        typeof item.previewUrl === "string" &&
        /^https:///i.test(item.previewUrl),
    )
    .map((item) => ({
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName?.trim() || null,
      artworkUrl: item.artworkUrl100?.replace("100x100bb", "300x300bb") ?? null,
      previewUrl: item.previewUrl,
      externalUrl: item.trackViewUrl ?? null,
    }))
    .slice(0, 8);

  if (!tracks.length) {
    throw new Error(`Não encontrei uma prévia reproduzível para "${query}".`);
  }

  return {
    tracks,
    provider: "itunes-preview",
    limitation:
      "O modo integrado reproduz prévias licenciadas do catálogo. Para faixas completas, conecte um serviço de streaming compatível.",
  };
}
