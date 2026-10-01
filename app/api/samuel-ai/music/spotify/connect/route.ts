import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { buildSpotifyAuthorizeUrl } from "@/features/samuel-ai/music/spotify.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  try {
    const destination = await buildSpotifyAuthorizeUrl({
      companyId,
      origin: url.origin,
      returnTo: url.searchParams.get("returnTo") || "/samuel-ai",
    });
    return Response.redirect(destination, 302);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao iniciar conexão Spotify." },
      { status: 503 },
    );
  }
}
