"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Clapperboard,
  Film,
  FolderOpen,
  LoaderCircle,
  PlayCircle,
  RefreshCcw,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { cn } from "@/utils/cn";

import { LongVideoStudio } from "./LongVideoStudio";
import { ReferenceImageLibrary } from "./ReferenceImageLibrary";
import { SamuelContentStudio as CampaignStudio } from "./SamuelContentStudio";
import type { ContentReadiness, SocialPlatform } from "./samuel-content.types";
import { SOCIAL_PLATFORMS } from "./samuel-content.types";

type Props = { companyId: string };
type StudioTab = "dashboard" | "create" | "long" | "library";

type PublishJob = {
  id: string;
  projectId?: string | null;
  platform: SocialPlatform;
  status: string;
  providerPostId?: string | null;
  permalink?: string | null;
  error?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type CreativeJob = {
  id: string;
  kind: string;
  title?: string | null;
  status: string;
  provider?: string | null;
  model?: string | null;
  error?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

const ICONS = {
  facebook: UsersRound,
  instagram: Camera,
  youtube: PlayCircle,
  tiktok: Film,
  linkedin: BriefcaseBusiness,
};

function timeLabel(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function statusClasses(status: string) {
  const normalized = status.toLowerCase();
  if (["published", "ready", "completed", "succeeded"].includes(normalized)) return "border-emerald-300/20 bg-emerald-300/[.06] text-emerald-100";
  if (["failed", "error", "canceled"].includes(normalized)) return "border-red-300/20 bg-red-300/[.06] text-red-100";
  return "border-amber-300/20 bg-amber-300/[.06] text-amber-100";
}

export function SocialStudioPro({ companyId }: Props) {
  const [tab, setTab] = useState<StudioTab>("dashboard");
  const [readiness, setReadiness] = useState<ContentReadiness | null>(null);
  const [publishJobs, setPublishJobs] = useState<PublishJob[]>([]);
  const [creativeJobs, setCreativeJobs] = useState<CreativeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);

  const connectedCount = useMemo(
    () => readiness ? Object.values(readiness.publishing).filter((item) => item.ready).length : 0,
    [readiness],
  );
  const publishedCount = publishJobs.filter((job) => job.status === "published").length;
  const failedCount = publishJobs.filter((job) => job.status === "failed").length;

  async function loadDashboard() {
    setLoading(true);
    setWarning(null);
    try {
      const [readinessResponse, dashboardResponse] = await Promise.all([
        fetch(`/api/samuel-ai/content-studio?companyId=${encodeURIComponent(companyId)}`, { cache: "no-store" }),
        fetch(`/api/samuel-ai/content-studio/social-dashboard?companyId=${encodeURIComponent(companyId)}`, { cache: "no-store" }),
      ]);
      const readinessPayload = await readinessResponse.json().catch(() => ({})) as { readiness?: ContentReadiness; error?: string };
      const dashboardPayload = await dashboardResponse.json().catch(() => ({})) as { publishJobs?: PublishJob[]; creativeJobs?: CreativeJob[]; warnings?: string[]; error?: string };
      if (!readinessResponse.ok) throw new Error(readinessPayload.error || "Falha ao verificar integrações.");
      if (!dashboardResponse.ok) throw new Error(dashboardPayload.error || "Falha ao carregar o painel social.");
      setReadiness(readinessPayload.readiness ?? null);
      setPublishJobs(dashboardPayload.publishJobs ?? []);
      setCreativeJobs(dashboardPayload.creativeJobs ?? []);
      if (dashboardPayload.warnings?.length) setWarning(dashboardPayload.warnings.join(" · "));
    } catch (cause) {
      setWarning(cause instanceof Error ? cause.message : "Falha ao carregar painel social.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  function connectPlatform(platform: SocialPlatform) {
    if (platform === "facebook" || platform === "instagram") {
      window.location.assign(`/integrations/meta/connect?companyId=${encodeURIComponent(companyId)}`);
      return;
    }
    if (platform === "linkedin") {
      window.location.assign(`/integrations/linkedin/connect?companyId=${encodeURIComponent(companyId)}`);
      return;
    }
    window.location.assign("/integrations");
  }

  const tabs: Array<{ id: StudioTab; label: string; icon: typeof Sparkles }> = [
    { id: "dashboard", label: "Painel Social", icon: BarChart3 },
    { id: "create", label: "Criar & Publicar", icon: Sparkles },
    { id: "long", label: "Vídeos Longos", icon: Clapperboard },
    { id: "library", label: "Biblioteca", icon: FolderOpen },
  ];

  return (
    <section className="min-h-full space-y-5">
      <header className="rounded-[26px] border border-white/[.07] bg-[radial-gradient(circle_at_12%_0%,rgba(0,174,255,.12),transparent_34%),linear-gradient(180deg,#07131f,#03080e)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-cyan-300/55">SOCIAL MEDIA & VIDEO OS</p>
            <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Redes sociais, campanhas, vídeos curtos e vídeos longos.</h1>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45">Gestão centralizada das conexões, produção, referências, prévias e publicações verificadas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2"><strong className="block text-sm text-cyan-100">{connectedCount}/5</strong><span className="text-[8px] uppercase tracking-[.12em] text-white/30">redes conectadas</span></div>
            <div className="rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2"><strong className="block text-sm text-emerald-100">{publishedCount}</strong><span className="text-[8px] uppercase tracking-[.12em] text-white/30">publicações verificadas</span></div>
            <button type="button" onClick={() => void loadDashboard()} disabled={loading} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-[10px] text-white/55 hover:text-white disabled:opacity-50"><RefreshCcw className={cn("size-4", loading && "animate-spin")} />Atualizar</button>
          </div>
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn("flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-xs font-medium transition", tab === item.id ? "border-cyan-300/30 bg-cyan-300/[.09] text-cyan-50" : "border-white/[.07] bg-white/[.02] text-white/42 hover:text-white/70")}><item.icon className="size-4" />{item.label}</button>)}
        </nav>
      </header>

      {tab === "dashboard" ? (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Contas prontas" value={`${connectedCount}/5`} detail="canais com credenciais reconhecidas" />
            <Metric label="Publicadas" value={publishedCount} detail="confirmações reais do provedor" />
            <Metric label="Falhas" value={failedCount} detail="jobs que exigem revisão" danger={failedCount > 0} />
            <Metric label="Vídeo IA" value={readiness?.aiVideo.ready ? "Ativo" : "Fallback"} detail={readiness?.aiVideo.ready ? readiness.aiVideo.provider : "renderizador Samuel disponível"} />
          </section>

          <section className="rounded-[24px] border border-white/[.07] bg-white/[.025] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><div><span className="text-[9px] uppercase tracking-[.18em] text-white/30">CANAIS</span><h2 className="mt-1 text-base font-semibold text-white">Contas e publicação</h2></div>{loading ? <LoaderCircle className="size-4 animate-spin text-cyan-300" /> : null}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = ICONS[platform];
                const ready = readiness?.publishing[platform].ready;
                return <article key={platform} className={cn("rounded-2xl border p-3", ready ? "border-emerald-300/15 bg-emerald-300/[.035]" : "border-white/[.07] bg-black/15")}><div className="flex items-center justify-between"><Icon className={cn("size-5", ready ? "text-emerald-200" : "text-cyan-200/60")} /><span className={cn("rounded-full px-2 py-1 text-[8px] uppercase tracking-wider", ready ? "bg-emerald-300/10 text-emerald-100" : "bg-white/[.04] text-white/30")}>{ready ? "Pronto" : "Conectar"}</span></div><strong className="mt-3 block text-sm text-white">{LABELS[platform]}</strong><p className="mt-1 min-h-12 text-[10px] leading-4 text-white/35">{readiness?.publishing[platform].detail ?? "Verificando integração…"}</p><button type="button" onClick={() => connectPlatform(platform)} className="mt-3 min-h-9 w-full rounded-lg border border-white/[.08] text-[10px] text-white/55 hover:bg-white/[.04]">{ready ? "Gerenciar" : "Conectar"}</button></article>;
              })}
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <section className="rounded-[24px] border border-white/[.07] bg-white/[.025] p-4 sm:p-5">
              <div className="flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-[.18em] text-white/30">PUBLICAÇÕES</span><h2 className="mt-1 text-base font-semibold text-white">Histórico recente</h2></div><Send className="size-4 text-cyan-300/60" /></div>
              <div className="mt-4 space-y-2">{publishJobs.length ? publishJobs.slice(0, 10).map((job) => <article key={job.id} className="rounded-xl border border-white/[.06] bg-black/15 p-3"><div className="flex items-start justify-between gap-3"><div><strong className="text-xs text-white">{LABELS[job.platform] ?? job.platform}</strong><p className="mt-1 text-[9px] text-white/30">{timeLabel(job.createdAt)}{job.providerPostId ? ` · ID ${job.providerPostId}` : ""}</p></div><span className={cn("rounded-full border px-2 py-1 text-[8px] uppercase tracking-wider", statusClasses(job.status))}>{job.status}</span></div>{job.error ? <p className="mt-2 text-[10px] leading-4 text-red-200/70">{job.error}</p> : null}{job.permalink ? <a href={job.permalink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[10px] text-cyan-200/70 underline underline-offset-2">Abrir publicação</a> : null}</article>) : <EmptyState text="Ainda não há publicações verificadas nesta empresa." />}</div>
            </section>

            <section className="rounded-[24px] border border-white/[.07] bg-white/[.025] p-4 sm:p-5">
              <div className="flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-[.18em] text-white/30">PRODUÇÃO</span><h2 className="mt-1 text-base font-semibold text-white">Jobs criativos</h2></div><Film className="size-4 text-violet-300/60" /></div>
              <div className="mt-4 space-y-2">{creativeJobs.length ? creativeJobs.slice(0, 10).map((job) => <article key={job.id} className="rounded-xl border border-white/[.06] bg-black/15 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-xs text-white">{job.title || job.kind}</strong><p className="mt-1 text-[9px] text-white/30">{job.provider || "Samuel"}{job.model ? ` · ${job.model}` : ""} · {timeLabel(job.createdAt)}</p></div><span className={cn("rounded-full border px-2 py-1 text-[8px] uppercase tracking-wider", statusClasses(job.status))}>{job.status}</span></div>{job.error ? <p className="mt-2 text-[10px] leading-4 text-red-200/70">{job.error}</p> : null}</article>) : <EmptyState text="Nenhuma geração IA registada ainda." />}</div>
            </section>
          </div>

          <section className="grid gap-3 md:grid-cols-3">
            <button type="button" onClick={() => setTab("create")} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[.05] p-4 text-left hover:bg-cyan-300/[.08]"><Sparkles className="size-5 text-cyan-300" /><strong className="mt-3 block text-sm text-white">Criar campanha</strong><p className="mt-1 text-xs leading-5 text-white/38">Roteiro, vídeo curto, prévia e publicação.</p></button>
            <button type="button" onClick={() => setTab("long")} className="rounded-2xl border border-violet-300/15 bg-violet-300/[.04] p-4 text-left hover:bg-violet-300/[.07]"><Clapperboard className="size-5 text-violet-300" /><strong className="mt-3 block text-sm text-white">Criar vídeo longo</strong><p className="mt-1 text-xs leading-5 text-white/38">Até 10 minutos, com narração e referências.</p></button>
            <button type="button" onClick={() => setTab("library")} className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4 text-left hover:bg-white/[.04]"><FolderOpen className="size-5 text-white/60" /><strong className="mt-3 block text-sm text-white">Biblioteca visual</strong><p className="mt-1 text-xs leading-5 text-white/38">Imagens próprias para manter produto e marca consistentes.</p></button>
          </section>
        </div>
      ) : null}

      {tab === "create" ? <CampaignStudio companyId={companyId} /> : null}
      {tab === "long" ? <LongVideoStudio companyId={companyId} /> : null}
      {tab === "library" ? <div className="space-y-5"><ReferenceImageLibrary companyId={companyId} /><section className="rounded-[24px] border border-white/[.07] bg-white/[.025] p-5"><div className="flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald-300" /><h2 className="text-sm font-semibold text-white">Como a biblioteca é usada</h2></div><p className="mt-2 max-w-3xl text-xs leading-5 text-white/42">As imagens selecionadas entram no renderizador Samuel com pan, zoom, enquadramento e sobreposição cinematográfica. Quando Runway estiver configurado, a primeira referência selecionada também pode orientar a geração de vídeo IA.</p></section></div> : null}

      {warning ? <p className="rounded-xl border border-amber-300/15 bg-amber-300/[.05] p-3 text-xs text-amber-100/75">{warning}</p> : null}
    </section>
  );
}

function Metric({ label, value, detail, danger = false }: { label: string; value: string | number; detail: string; danger?: boolean }) {
  return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><span className="text-[9px] uppercase tracking-[.14em] text-white/30">{label}</span><strong className={cn("mt-2 block text-2xl", danger ? "text-red-200" : "text-cyan-100")}>{value}</strong><p className="mt-1 text-[10px] leading-4 text-white/32">{detail}</p></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-white/[.08] p-6 text-center text-xs text-white/28">{text}</div>;
}
