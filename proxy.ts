import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PAGE_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/future-me",
]);

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PAGE_PATHS.has(pathname) ||
    pathname.startsWith("/future-me-") ||
    pathname === "/future-me.html" ||
    pathname === "/api/samuel-ai/autonomous-improvement"
  );
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
