import { completeSpotifyAuthorization } from "@/features/samuel-ai/music/spotify.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim();
  const state = url.searchParams.get("state")?.trim();
  const error = url.searchParams.get("error")?.trim();

  if (error) {
    return Response.redirect(new URL("/samuel-ai?spotify=denied", url.origin), 302);
  }
  if (!code || !state) {
    return Response.redirect(new URL("/samuel-ai?spotify=invalid", url.origin), 302);
  }

  try {
    const completed = await completeSpotifyAuthorization({
      code,
      state,
      origin: url.origin,
    });
    const target = new URL(completed.returnTo, url.origin);
    target.searchParams.set("spotify", "connected");
    return Response.redirect(target, 302);
  } catch {
    return Response.redirect(new URL("/samuel-ai?spotify=error", url.origin), 302);
  }
}
