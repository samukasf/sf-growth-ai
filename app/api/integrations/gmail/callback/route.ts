import { GET as handleGoogleOAuthCallback } from "../../google/oauth/callback/route";

// Compatibility endpoint for older Google OAuth client configurations.
// The active OAuth flow uses /api/integrations/google/oauth/callback.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleGoogleOAuthCallback(request);
}
