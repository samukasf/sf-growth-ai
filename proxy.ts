import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PAGE_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/future-me",
]);

const BEARER_AUTH_API_PATHS = new Set([
  "/api/samuel-ai/mobile/bootstrap",
  "/api/samuel-ai/chat",
  "/api/samuel-ai/transcribe",
  "/api/samuel-ai/voice/tts",
  "/api/samuel-ai/realtime/offer",
  "/api/samuel-desktop/voice-command",
  "/api/samuel-desktop/control",
]);

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PAGE_PATHS.has(pathname) ||
    pathname.startsWith("/future-me-") ||
    pathname === "/future-me.html" ||
    pathname === "/api/samuel-ai/autonomous-improvement" ||
    pathname === "/api/samuel-desktop/device" ||
    pathname === "/api/samuel-desktop/computer-step"
  );
}

function delegatesBearerAuthToRoute(request: NextRequest) {
  if (!BEARER_AUTH_API_PATHS.has(request.nextUrl.pathname)) return false;
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  return /^Bearer\s+\S+/i.test(authorization);
}

function authRequiredResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Autenticação obrigatória.", code: "AUTH_REQUIRED" },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (isPublicPath(request.nextUrl.pathname)) return response;
    return NextResponse.json(
      { error: "Autenticação indisponível: configuração do servidor incompleta." },
      { status: 503 },
    );
  }

  // Native Samuel clients authenticate with a Supabase Bearer token instead of
  // browser cookies. Only explicitly listed endpoints may bypass cookie auth,
  // and every listed route validates the Bearer token again server-side.
  if (delegatesBearerAuthToRoute(request)) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const publicPath = isPublicPath(request.nextUrl.pathname);

  if (!user && !publicPath) return authRequiredResponse(request);

  if (
    user &&
    ["/login", "/signup", "/forgot-password"].includes(request.nextUrl.pathname)
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2)$).*)",
  ],
};
