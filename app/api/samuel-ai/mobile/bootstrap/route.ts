import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { listSamuelCapabilities } from "@/features/samuel-ai/capabilities/samuel-capability-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const companyId =
    new URL(request.url).searchParams.get("companyId")?.trim() || "default-company";

  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const capabilities = listSamuelCapabilities().map((capability) => ({
    id: capability.id,
    title: capability.title,
    description: capability.description,
    domain: capability.domain,
    availability: capability.availability,
    executionClass: capability.executionClass,
    minimumAutonomy: capability.minimumAutonomy,
    requiresApproval: capability.requiresApproval,
    evidencePolicy: capability.evidencePolicy,
    voiceEnabled: capability.voiceEnabled,
    requirements: capability.requirements,
  }));

  return Response.json(
    {
      version: 1,
      identity: {
        id: "samuel-ai",
        name: "Samuel AI",
        role: "presença executiva",
        continuity: "shared-core",
      },
      companyId,
      userId: auth.user.id,
      interaction: {
        text: true,
        nativeMicrophone: true,
        neuralVoice: true,
        desktopControl: true,
        proactiveNotifications: false,
      },
      voice: {
        persona: "Camilla",
        providerPreference: "elevenlabs",
        transcriptionEndpoint: "/api/samuel-ai/transcribe",
        synthesisEndpoint: "/api/samuel-ai/voice/tts",
      },
      endpoints: {
        chat: "/api/samuel-ai/chat",
        desktopCommand: "/api/samuel-desktop/voice-command",
        realtimeOffer: "/api/samuel-ai/realtime/offer",
      },
      capabilities,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
