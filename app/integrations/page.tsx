import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Linkedin,
  Mail,
  MapPin,
  MessageCircleMore,
  PanelsTopLeft,
  Settings2,
  Store,
  TriangleAlert,
} from "lucide-react";

import { getGoogleIntegrationStatus } from "@/features/google-integrations/google-capabilities.server";
import { getWhatsAppConfigStatus } from "@/features/whatsapp/whatsapp-config.server";
import { findMetaOAuthConnection } from "@/integrations/meta/meta-token.repository";
import { resolveMetaOAuthConfig } from "@/integrations/meta/meta.auth";
import { isLinkedInConfigured } from "@/integrations/linkedin";
import { resolveActiveCompany } from "@/services/executive-context.server";

export const dynamic = "force-dynamic";

type IntegrationsPageProps = {
  searchParams?: Promise<{ companyId?: string }> | { companyId?: string };
};

type CardStatus = "connected" | "partial" | "disconnected" | "setup";

function StatusBadge({ status }: { status: CardStatus }) {
  const labels: Record<CardStatus, string> = {
    connected: "Conectado",
    partial: "Reconectar",
    disconnected: "Desconectado",
    setup: "Configuração necessária",
  };
  const ok = status === "connected";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.1em] ${ok ? "border-emerald-300/15 bg-emerald-300/[.06] text-emerald-200/70" : "border-amber-300/15 bg-amber-300/[.05] text-amber-100/55"}`}>
      {ok ? <CheckCircle2 className="size-3" /> : <TriangleAlert className="size-3" />}{labels[status]}
    </span>
  );
}

export default async function IntegrationsPage({ searchParams }: IntegrationsPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const company = await resolveActiveCompany(params.companyId?.trim() || null).catch(() => null);
  const companyId = company?.id ?? null;

  const [google, meta] = companyId
    ? await Promise.all([
        getGoogleIntegrationStatus(companyId),
        findMetaOAuthConnection(companyId).catch(() => null),
      ])
    : [null, null];

  const whatsapp = companyId ? getWhatsAppConfigStatus(companyId) : null;
  const linkedIn = companyId ? isLinkedInConfigured(companyId) : false;

  const googleWorkspaceReady = Boolean(
    google?.capabilities.gmail &&
    google?.capabilities.calendar &&
    google?.capabilities.drive &&
    google?.capabilities.contacts,
  );
  const googleMapsReady = Boolean(
    google?.capabilities.businessProfile &&
    google?.capabilities.places &&
    google?.capabilities.geocoding,
  );

  const googleWorkspaceStatus: CardStatus = !google?.oauthConfigured
    ? "setup"
    : googleWorkspaceReady
      ? "connected"
      : google?.connected
        ? "partial"
        : "disconnected";
  const googleMapsStatus: CardStatus = !google?.oauthConfigured
    ? "setup"
    : googleMapsReady
      ? "connected"
      : google?.connected
        ? "partial"
        : "disconnected";
  const metaStatus: CardStatus = !resolveMetaOAuthConfig()
    ? "setup"
    : meta
      ? "connected"
      : "disconnected";
  const whatsappStatus: CardStatus = whatsapp?.configured ? "connected" : "setup";
  const linkedInStatus: CardStatus = linkedIn ? "connected" : "setup";

  const withCompany = (href: string) => {
    if (!companyId) return href;
    const separator = href.includes("?") ? "&" : "?";
    return `${href}${separator}companyId=${encodeURIComponent(companyId)}`;
  };

  const cards = [
    {
      title: "Google Workspace",
      description: "Gmail, Google Agenda, Drive e Contatos. Uma única conexão para e-mail, agenda, arquivos e contexto.",
      href: withCompany("/integrations/google/connect"),
      icon: CalendarDays,
      status: googleWorkspaceStatus,
      action: google?.connected ? "Gerir / reconectar" : "Conectar Google",
      detail: google?.email ?? "Nenhuma conta Google autorizada",
    },
    {
      title: "Google Maps & Business Profile",
      description: "Pesquisa de empresas no Maps/Places, endereços, geocoding e acesso aos perfis empresariais do Google.",
      href: `${withCompany("/integrations/google/connect")}#maps`,
      icon: MapPin,
      status: googleMapsStatus,
      action: googleMapsReady ? "Testar Maps" : "Conectar / autorizar",
      detail: googleMapsReady ? "Permissões Maps e Business Profile concedidas" : "Usa a mesma autorização Google",
    },
    {
      title: "Meta",
      description: "Facebook Page, Instagram, insights, publicação de conteúdo e gestão de anúncios quando as permissões da app estiverem aprovadas.",
      href: withCompany("/integrations/meta/connect"),
      icon: PanelsTopLeft,
      status: metaStatus,
      action: meta ? "Gerir / reconectar" : "Conectar Meta",
      detail: meta?.pageName ?? meta?.pageId ?? "Facebook/Instagram não ligados",
    },
    {
      title: "WhatsApp Business",
      description: "Mensagens empresariais pela plataforma oficial da Meta, com isolamento por empresa e confirmação antes do envio.",
      href: withCompany("/samuel-ai"),
      icon: MessageCircleMore,
      status: whatsappStatus,
      action: whatsapp?.configured ? "Abrir WhatsApp" : "Configurar WhatsApp",
      detail: whatsapp?.configured ? "Número empresarial configurado" : "Credenciais empresariais ainda necessárias",
    },
    {
      title: "LinkedIn",
      description: "Página empresarial e dados de marketing/organização para presença B2B e pesquisa.",
      href: withCompany("/integrations/linkedin/connect"),
      icon: Linkedin,
      status: linkedInStatus,
      action: linkedIn ? "Gerir LinkedIn" : "Configurar LinkedIn",
      detail: linkedIn ? "Token empresarial configurado" : "Configuração de servidor necessária",
    },
  ] as const;

  return (
    <main className="min-h-dvh bg-[#04080d] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-white/[.07] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-cyan-200/45">SF Growth AI</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Central de integrações</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/38">Conecte os serviços que o Samuel pode realmente usar. O estado abaixo é calculado para a empresa ativa; funções sem credencial ou permissão não são apresentadas como conectadas.</p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-white/28"><Store className="size-3.5" /><span>{company?.name ?? "Nenhuma empresa ativa"}</span></div>
          </div>
          <div className="flex gap-2">
            <Link href={companyId ? `/empresas/${companyId}` : "/empresas"} className="rounded-xl border border-white/[.08] bg-white/[.03] px-4 py-2.5 text-xs font-semibold text-white/55">Empresa</Link>
            <Link href={companyId ? `/samuel-ai?companyId=${companyId}` : "/samuel-ai"} className="rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-4 py-2.5 text-xs font-semibold text-cyan-50">Voltar ao Samuel</Link>
          </div>
        </header>

        {!companyId && <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-4 text-xs leading-6 text-amber-100/65">Selecione ou crie uma empresa antes de conectar serviços. Todas as credenciais e permissões são associadas à empresa ativa.</div>}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((item) => (
            <article key={item.title} className="flex min-h-[245px] flex-col rounded-3xl border border-white/[.075] bg-[#08131e] p-5 shadow-[0_18px_55px_rgba(0,0,0,.22)]">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.06] text-cyan-200"><item.icon className="size-5" /></span>
                <StatusBadge status={item.status} />
              </div>
              <h2 className="mt-4 text-base font-semibold text-white/90">{item.title}</h2>
              <p className="mt-2 text-xs leading-5 text-white/35">{item.description}</p>
              <p className="mt-3 truncate text-[10px] text-white/24">{item.detail}</p>
              <Link href={item.href} className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/[.08] bg-white/[.035] px-4 py-2.5 text-xs font-semibold text-white/62 transition hover:border-cyan-300/20 hover:bg-cyan-300/[.05] hover:text-cyan-50"><Settings2 className="size-3.5" />{item.action}</Link>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4"><div className="flex items-center gap-3"><Mail className="size-4 text-cyan-200/45" /><div><strong className="text-xs text-white/65">Gmail + Agenda</strong><p className="mt-1 text-[10px] leading-5 text-white/27">Usam o mesmo OAuth Google. Não é necessário conectar separadamente.</p></div></div></div>
          <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4"><div className="flex items-center gap-3"><MapPin className="size-4 text-cyan-200/45" /><div><strong className="text-xs text-white/65">Maps + Business Profile</strong><p className="mt-1 text-[10px] leading-5 text-white/27">Também usam a conexão Google, mas as APIs correspondentes precisam estar habilitadas no Google Cloud.</p></div></div></div>
          <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4"><div className="flex items-center gap-3"><PanelsTopLeft className="size-4 text-cyan-200/45" /><div><strong className="text-xs text-white/65">Meta + WhatsApp</strong><p className="mt-1 text-[10px] leading-5 text-white/27">São produtos Meta, mas usam credenciais e permissões distintas para proteger cada empresa.</p></div></div></div>
        </section>
      </div>
    </main>
  );
}
