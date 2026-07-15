import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { cookies } from "next/headers";

const SESSION_COOKIE = "sf_growth_ai_chat_session";

export async function getWorkspaceSessionIdentity() {
  const cookieStore = await cookies();
  let sessionKey = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionKey) {
    sessionKey = randomUUID();
    cookieStore.set(SESSION_COOKIE, sessionKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return {
    sessionKey,
    sessionHash: createHash("sha256").update(sessionKey).digest("hex"),
  };
}
