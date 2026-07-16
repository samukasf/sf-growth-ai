import Link from "next/link";

import { isLinkedInConfigured } from "@/integrations/linkedin";
import { resolveActiveCompany } from "@/services/executive-context.service";

export const dynamic = "force-dynamic";

type ConnectPageProps = {
  searchParams?: Promise<{ companyId?: string }> | { companyId?: string };
};

export default async function LinkedInConnectPage({ searchParams }: ConnectPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const company = await resolveActiveCompany(params.companyId?.trim() || null).catch(() => null);
  const configured = isLinkedInConfigured(company?.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Integrações
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">LinkedIn</h1>
        <p className="mt-2 text-sm text-zinc-400">
          A integração usa token de servidor da Community Management / Marketing API.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Empresa</dt>
            <dd className="text-zinc-100">{company?.name ?? "Nenhuma empresa encontrada"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Estado</dt>
            <dd className={configured ? "text-emerald-300" : "text-amber-300"}>
              {configured ? "Token configurado no servidor" : "Token ausente"}
            </dd>
          </div>
        </dl>

        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
          <li>Crie um app LinkedIn com acesso à organização.</li>
          <li>
            Gere um access token com permissões de estatísticas da Company Page.
          </li>
          <li>
            Defina <code className="text-zinc-200">LINKEDIN_ACCESS_TOKEN</code> e{" "}
            <code className="text-zinc-200">LINKEDIN_ORG_ID</code> no ambiente (ou{" "}
            <code className="text-zinc-200">LINKEDIN_ORG_MAP</code> por empresa).
          </li>
          <li>Reinicie o deploy e abra o Samuel AI.</li>
        </ol>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={company ? `/samuel-ai?companyId=${company.id}` : "/samuel-ai"}
            className="inline-flex items-center justify-center rounded-xl bg-[#0A66C2] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Abrir Samuel AI
          </Link>
          <Link
            href="/integrations/google/connect"
            className="text-center text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            Ver outras integrações
          </Link>
        </div>
      </div>
    </main>
  );
}
