import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML_BYTES = 2 * 1024 * 1024;

type PublishBody = {
  companyId?: string;
  projectId?: string | null;
  projectName?: string;
  businessName?: string;
  domain?: string;
  html?: string;
};

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "site-samuel";
}

function cleanDomain(value: string | undefined) {
  const domain = (value ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!domain) return null;
  if (!/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    throw new Error("Domínio inválido. Use apenas o domínio, por exemplo: minhaempresa.pt");
  }
  return domain;
}

async function vercelRequest(path: string, token: string, teamId: string | undefined, init: RequestInit) {
  const separator = path.includes("?") ? "&" : "?";
  const url = `https://api.vercel.com${path}${teamId ? `${separator}teamId=${encodeURIComponent(teamId)}` : ""}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as PublishBody | null;
  const companyId = body?.companyId?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const html = body?.html?.trim() ?? "";
  if (!html || !/^<!doctype html>/i.test(html)) {
    return Response.json({ error: "O projeto não contém um HTML publicável." }, { status: 400 });
  }
  if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
    return Response.json({ error: "O site excede o limite de 2 MB para esta publicação." }, { status: 413 });
  }

  let domain: string | null;
  try {
    domain = cleanDomain(body?.domain);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Domínio inválido." }, { status: 400 });
  }

  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    return Response.json(
      { error: "Publicação ainda não configurada no servidor. Adicione VERCEL_TOKEN ao ambiente de produção.", code: "VERCEL_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const teamId = process.env.VERCEL_TEAM_ID?.trim() || undefined;
  const projectName = slug(`samuel-${companyId}-${body?.projectId || body?.projectName || body?.businessName || "site"}`);
  const deploymentResponse = await vercelRequest("/v13/deployments", token, teamId, {
    method: "POST",
    body: JSON.stringify({
      name: projectName,
      target: "production",
      files: [{ file: "index.html", data: Buffer.from(html, "utf8").toString("base64"), encoding: "base64" }],
      projectSettings: { framework: null },
    }),
  });
  const deployment = (await deploymentResponse.json().catch(() => null)) as
    | { id?: string; url?: string; projectId?: string; error?: { message?: string } }
    | null;
  if (!deploymentResponse.ok || !deployment?.url) {
    return Response.json(
      { error: deployment?.error?.message || "A Vercel recusou a publicação do site." },
      { status: deploymentResponse.status || 502 },
    );
  }

  if (domain) {
    const project = deployment.projectId || projectName;
    const domainResponse = await vercelRequest(`/v10/projects/${encodeURIComponent(project)}/domains`, token, teamId, {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    });
    if (!domainResponse.ok && domainResponse.status !== 409) {
      const domainPayload = (await domainResponse.json().catch(() => null)) as { error?: { message?: string } } | null;
      return Response.json(
        {
          error: domainPayload?.error?.message || "O site foi publicado, mas o domínio não pôde ser ligado.",
          url: `https://${deployment.url}`,
          code: "DOMAIN_CONFIGURATION_FAILED",
        },
        { status: 409 },
      );
    }
  }

  return Response.json({
    ok: true,
    deploymentId: deployment.id,
    url: `https://${deployment.url}`,
    domain,
    project: projectName,
  });
}
