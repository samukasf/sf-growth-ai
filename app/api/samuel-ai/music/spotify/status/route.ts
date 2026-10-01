import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  disconnectSpotify,
  spotifyStatus,
} from "@/features/samuel-ai/music/spotify.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;
  return Response.json(await spotifyStatus(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;
  await disconnectSpotify();
  return Response.json({ ok: true });
}
