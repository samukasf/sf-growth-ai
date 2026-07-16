import Link from "next/link";

import { resolveActiveCompany } from "@/services/executive-context.service";
import { findGoogleOAuthConnection, resolveGoogleOAuthConfig } from "@/integrations/gmail";

export const dynamic = "force-dynamic";

type ConnectPageProps = {
  searchParams?: Promise<{
    companyId?: string;
    connected?: string;
    error?: string;
  }> | {
    companyId?: string;
    connected?: string;
    error?: string;
  };
};

export default async function GoogleConnectPage({ searchParams }: ConnectPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const company = await resolveActiveCompany(params.companyId?.trim() || null).catch(() => null);
  const oauthReady = Boolean(resolveGoogleOAuthConfig());

  let connectionEmail: string | null = null;
  if (company) {
    try {
      const connection = await findGoogleOAuthConnection(company.id);
      connectionEmail = connection?.googleEmail ?? null;
    } catch {
      connectionEmail = null;
    }
  }

  const authorizeHref = company
    ? `/api/integrations/google/oauth/authorize?companyId=${encodeURIComponent(company.id)}`
    : "/api/integrations/google/oauth/authorize";

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Integrações
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
          Google Workspace
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Conecte Gmail, Agenda, Drive e Contatos. Com Gmail, o Samuel pode ler, enviar,
          arquivar, organizar e apagar e-mails (com a sua confirmação).
        </p>
      </div>

      {params.connected === "1" ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Conta Google conectada com sucesso
          {connectionEmail ? ` (${connectionEmail})` : ""}.
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Falha na conexão: {params.error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Empresa</dt>
            <dd className="text-zinc-100">{company?.name ?? "Nenhuma empresa encontrada"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">OAuth</dt>
            <dd className={oauthReady ? "text-emerald-300" : "text-amber-300"}>
              {oauthReady ? "Configurado" : "Variáveis ausentes"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Estado</dt>
            <dd className="text-zinc-100">
              {connectionEmail ? `Conectado · ${connectionEmail}` : "Desconectado"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={authorizeHref}
            className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-50"
            aria-disabled={!company || !oauthReady}
          >
            {connectionEmail ? "Reconectar Google" : "Conectar Google"}
          </a>
          <Link
            href={company ? `/samuel-ai?companyId=${company.id}` : "/samuel-ai"}
            className="text-center text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            Voltar ao Samuel AI
          </Link>
        </div>
      </div>
    </main>
  );
}
