"use client";

import { useState } from "react";

type InboxMessage = {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  unread: boolean;
};

type InboxResponse = {
  source: string;
  emailAddress: string;
  unreadCount: number;
  messages: InboxMessage[];
};

type ErrorResponse = {
  error: string;
  code?: string;
};

export function GmailInboxTester({ defaultCompanyId }: { defaultCompanyId?: string }) {
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InboxResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);

  async function handleTest() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/integrations/gmail/inbox?companyId=${encodeURIComponent(companyId)}`,
      );
      const data = (await response.json()) as InboxResponse | ErrorResponse;

      if (!response.ok || "error" in data) {
        setError(data as ErrorResponse);
      } else {
        setResult(data as InboxResponse);
      }
    } catch (err) {
      setError({ error: err instanceof Error ? err.message : "Falha de rede" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-sm font-semibold text-white">
        Prova de funcionamento — chamada real à Gmail API
      </h2>
      <p className="text-xs text-zinc-400">
        Executa <span className="font-mono">GET /api/integrations/gmail/inbox</span>, que usa o
        access_token real (renovado automaticamente via refresh_token) para listar as mensagens
        reais da Inbox conectada. Nenhum dado simulado.
      </p>

      <div className="flex gap-2">
        <input
          value={companyId}
          onChange={(event) => setCompanyId(event.target.value)}
          placeholder="companyId (UUID) já conectado"
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleTest}
          disabled={!companyId || loading}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Consultando..." : "Testar Inbox real"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/40 p-3 text-xs text-red-300">
          <span className="font-mono">{error.code ?? "ERRO"}</span>: {error.error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <p className="text-xs text-emerald-400">
            Conta: <span className="font-mono">{result.emailAddress}</span> · {result.unreadCount}{" "}
            não lida(s)
          </p>
          <ul className="space-y-2">
            {result.messages.map((message) => (
              <li
                key={message.id}
                className="rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300"
              >
                <p className="font-medium text-white">
                  {message.subject || "(sem assunto)"} {message.unread ? "• não lida" : ""}
                </p>
                <p className="text-zinc-400">{message.from}</p>
                <p className="mt-1 text-zinc-500">{message.snippet}</p>
              </li>
            ))}
          </ul>
          {result.messages.length === 0 && (
            <p className="text-xs text-zinc-500">Inbox vazia ou sem mensagens retornadas.</p>
          )}
        </div>
      )}
    </section>
  );
}
