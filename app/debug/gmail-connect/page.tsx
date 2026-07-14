import type { Metadata } from "next";

import { GmailInboxTester } from "./gmail-inbox-tester";

export const metadata: Metadata = {
  title: "Conectar Gmail | SF Growth AI",
  description:
    "Ferramenta de desenvolvimento para conectar uma conta Gmail real a uma empresa via Google OAuth (Sprints 83/86).",
};

type SearchParams = Promise<{
  connected?: string;
  companyId?: string;
  email?: string;
  error?: string;
  errorMessage?: string;
  errorCause?: string;
}>;

export default async function GmailConnectDebugRoute({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const connected = params.connected === "true";
  const hasError = Boolean(params.error);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-white">Conectar Gmail</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Ferramenta de desenvolvimento (Sprint 86+) para autorizar o Samuel a acessar Gmail,
            Google Calendar, Google Contacts e Google Drive via Google OAuth. Após adicionar novos
            scopes (ex.: Drive), reconecte a mesma empresa aqui. Nenhum dado é simulado — a conexão
            exige credenciais reais do Google Cloud (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).
          </p>
        </header>

        {connected && (
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            Conta Gmail conectada com sucesso para a empresa{" "}
            <span className="font-mono">{params.companyId}</span>
            {params.email ? (
              <>
                {" "}
                (<span className="font-mono">{params.email}</span>)
              </>
            ) : null}
            .
          </div>
        )}

        {hasError && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300 space-y-2">
            <p>
              Falha ao conectar o Gmail: <span className="font-mono">{params.error}</span>
            </p>
            {params.errorMessage ? (
              <p className="font-mono text-xs break-all">{params.errorMessage}</p>
            ) : null}
            {params.errorCause ? (
              <p className="font-mono text-xs break-all text-red-400">Causa: {params.errorCause}</p>
            ) : null}
          </div>
        )}

        <form action="/api/integrations/gmail/connect" method="GET" className="space-y-3">
          <label className="block text-sm text-zinc-300">
            Company ID (UUID real de <span className="font-mono">public.companies</span>)
            <input
              name="companyId"
              required
              placeholder="00000000-0000-0000-0000-000000000000"
              defaultValue={params.companyId ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
          >
            Conectar conta Gmail
          </button>
        </form>

        <p className="text-xs text-zinc-500">
          Ao clicar em &quot;Conectar&quot;, você será redirecionado à tela de consentimento do
          Google. Após aprovar, o Google retorna para{" "}
          <span className="font-mono">/api/integrations/gmail/callback</span>, que troca o código
          por tokens reais e salva a conexão em{" "}
          <span className="font-mono">google_oauth_connections</span>.
        </p>

        <GmailInboxTester defaultCompanyId={params.companyId} />
      </div>
    </main>
  );
}
