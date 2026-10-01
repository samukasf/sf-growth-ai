import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { executeSpotifyCommand } from "@/features/samuel-ai/music/spotify.server";
import type { SamuelMusicCommand } from "@/features/samuel-ai/music/samuel-music.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = new Set([
  "play",
  "pause",
  "resume",
  "stop",
  "next",
  "previous",
  "set_volume",
  "volume_up",
  "volume_down",
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { companyId?: string; command?: SamuelMusicCommand }
    | null;
  const companyId = body?.companyId?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const command = body?.command;
  if (!command || !ACTIONS.has(command.action)) {
    return Response.json({ error: "Comando de música inválido." }, { status: 400 });
  }

  try {
    return Response.json(await executeSpotifyCommand(command), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao controlar o Spotify." },
      { status: 400 },
    );
  }
}
