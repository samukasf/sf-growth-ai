import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { searchSamuelMusicCatalog } from "@/features/samuel-ai/music/samuel-music-catalog.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim() || "default-company";
  const query = url.searchParams.get("q")?.trim() || "";

  const auth = await authorizeCompanyRequest(companyId, {
    allowWorkspaceFallback: true,
  });
  if (!auth.ok) return auth.response;

  try {
    const result = await searchSamuelMusicCatalog({
      query,
      country: url.searchParams.get("country")?.trim() || "PT",
      signal: request.signal,
    });
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível pesquisar música.",
      },
      { status: 400 },
    );
  }
}
