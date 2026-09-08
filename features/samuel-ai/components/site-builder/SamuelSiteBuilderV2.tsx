"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Download,
  ExternalLink,
  FileCode2,
  FolderOpen,
  Globe2,
  LayoutTemplate,
  MapPinned,
  MessageCircle,
  Plus,
  Rocket,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { cn } from "@/utils/cn";
import {
  buildSiteBuilderFilename,
  buildSiteBuilderHtml,
  type SiteBuilderDraft,
  type SiteBuilderMode,
  type SiteBuilderTone,
} from "./site-builder-preview";

type SamuelSiteBuilderProps = {
  companyName?: string;
  companySegment?: string;
  companyLocation?: string;
};

type PreviewPage = "home" | "services" | "proof" | "app" | "contact";

type SiteProject = {
  id: string;
  name: string;
  draft: SiteBuilderDraft;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "sf-growth-ai:site-builder-projects:v2";

const MODE_OPTIONS: Array<{ value: SiteBuilderMode; label: string; description: string }> = [
  { value: "website", label: "Site", description: "Site responsivo pronto para validação e exportação." },
  { value: "app", label: "Mini-app", description: "Experiência navegável para validar produto digital." },
];

const TONE_OPTIONS: Array<{ value: SiteBuilderTone; label: string }> = [
  { value: "executive", label: "Tecnológico" },
  { value: "premium", label: "Premium" },
  { value: "local", label: "Local" },
];

const PREVIEW_PAGES: Array<{ id: PreviewPage; label: string; hash: string }> = [
  { id: "home", label: "Início", hash: "#home" },
  { id: "services", label: "Serviços", hash: "#services" },
  { id: "proof", label: "Resultados", hash: "#proof" },
  { id: "app", label: "App", hash: "#app" },
  { id: "contact", label: "Contato", hash: "#contact" },
];

function createDraft(companyName: string, companySegment: string, companyLocation: string): SiteBuilderDraft {
  return {
    mode: "website",
    businessName: companyName,
    segment: companySegment,
    offer: "Presença digital profissional para vender mais",
    goal: "receber pedidos de orçamento qualificados",
    location: companyLocation,
    cta: "Pedir orçamento",
    whatsapp: "",
    mapsQuery: companyLocation,
    tone: "executive",
  };
}

function makeProject(draft: SiteBuilderDraft, name?: string): SiteProject {
  const now = new Date().toISOString();
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `site-${Date.now()}`,
    name: name || draft.businessName || "Novo projeto",
    draft,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

function makeSrcDoc(html: string, page: PreviewPage) {
  const hash = PREVIEW_PAGES.find((item) => item.id === page)?.hash ?? "#home";
  return html.replace(
    "</body>",
    `<script>window.addEventListener("load",function(){window.location.hash=${JSON.stringify(hash)};});</script></body>`,
  );
}

function downloadHtml(html: string, filename: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function openHtmlPreview(html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function fieldClass() {
  return "w-full rounded-xl border border-white/[.09] bg-[#071421] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/22 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/[.06]";
}

export function SamuelSiteBuilderV2({
  companyName = "A sua empresa",
  companySegment = "serviços profissionais",
  companyLocation = "Portugal",
}: SamuelSiteBuilderProps) {
  const baseDraft = useMemo(
    () => createDraft(companyName, companySegment, companyLocation),
    [companyName, companySegment, companyLocation],
  );
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SiteBuilderDraft>(baseDraft);
  const [projectName, setProjectName] = useState(companyName);
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");
  const [showArchived, setShowArchived] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as SiteProject[]) : [];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          const first = parsed.find((project) => !project.archived) ?? parsed[0];
          if (first) {
            setCurrentId(first.id);
            setDraft(first.draft);
            setProjectName(first.name);
          }
        } else {
          const initial = makeProject(baseDraft, companyName);
          setProjects([initial]);
          setCurrentId(initial.id);
          setDraft(initial.draft);
          setProjectName(initial.name);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify([initial]));
        }
      } catch {
        const initial = makeProject(baseDraft, companyName);
        setProjects([initial]);
        setCurrentId(initial.id);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [baseDraft, companyName]);

  const persist = (nextProjects: SiteProject[]) => {
    setProjects(nextProjects);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
    } catch {
      // Browser storage can be unavailable in private/restricted contexts.
    }
  };

  const updateDraft = <Key extends keyof SiteBuilderDraft>(key: Key, value: SiteBuilderDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveCurrent = () => {
    const now = new Date().toISOString();
    const name = projectName.trim() || draft.businessName.trim() || "Projeto sem nome";
    if (!currentId) {
      const project = makeProject(draft, name);
      persist([project, ...projects]);
      setCurrentId(project.id);
    } else {
      const next = projects.map((project) =>
        project.id === currentId
          ? { ...project, name, draft, archived: false, updatedAt: now }
          : project,
      );
      persist(next);
    }
    setSaveNotice("Projeto salvo neste navegador");
    window.setTimeout(() => setSaveNotice(null), 2200);
  };

  const newProject = () => {
    const nextDraft = createDraft(companyName, companySegment, companyLocation);
    const project = makeProject(nextDraft, "Novo projeto");
    persist([project, ...projects]);
    setCurrentId(project.id);
    setDraft(project.draft);
    setProjectName(project.name);
    setPreviewPage("home");
    setShowArchived(false);
  };

  const openProject = (project: SiteProject) => {
    setCurrentId(project.id);
    setDraft(project.draft);
    setProjectName(project.name);
    setPreviewPage(project.draft.mode === "app" ? "app" : "home");
  };

  const archiveCurrent = () => {
    if (!currentId) return;
    const next = projects.map((project) =>
      project.id === currentId
        ? { ...project, name: projectName.trim() || project.name, draft, archived: true, updatedAt: new Date().toISOString() }
        : project,
    );
    persist(next);
    const nextActive = next.find((project) => !project.archived);
    if (nextActive) {
      openProject(nextActive);
    } else {
      const nextDraft = createDraft(companyName, companySegment, companyLocation);
      const project = makeProject(nextDraft, "Novo projeto");
      persist([project, ...next]);
      openProject(project);
    }
  };

  const html = useMemo(() => buildSiteBuilderHtml(draft), [draft]);
  const filename = useMemo(() => buildSiteBuilderFilename(draft), [draft]);
  const srcDoc = useMemo(() => makeSrcDoc(html, previewPage), [html, previewPage]);
  const previewPages = useMemo(
    () => PREVIEW_PAGES.filter((page) => draft.mode === "app" || page.id !== "app"),
    [draft.mode],
  );
  const visibleProjects = projects.filter((project) => project.archived === showArchived);
  const activeCount = projects.filter((project) => !project.archived).length;
  const archivedCount = projects.filter((project) => project.archived).length;

  return (
    <section className="min-h-[calc(100dvh-130px)] overflow-hidden rounded-[28px] border border-white/[.07] bg-[#06101a] text-white shadow-[0_24px_80px_rgba(0,0,0,.28)]">
      <header className="flex flex-col gap-4 border-b border-white/[.07] bg-[linear-gradient(180deg,rgba(8,31,53,.86),rgba(5,17,29,.72))] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[.08] text-cyan-200"><Globe2 className="size-5" /></span>
          <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-200/55">Samuel Studio</p><h2 className="mt-1 text-xl font-semibold">Sites & Apps</h2><p className="mt-1 text-xs text-white/40">Crie, salve, reabra, arquive e exporte projetos sem perder o trabalho.</p></div>
        </div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={newProject} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-xs font-semibold text-white/75 hover:bg-white/[.08]"><Plus className="size-4" /> Novo</button><button type="button" onClick={saveCurrent} className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-3.5 py-2.5 text-xs font-semibold text-cyan-50 hover:bg-cyan-300/[.12]"><Save className="size-4" /> Salvar</button><button type="button" onClick={archiveCurrent} className="flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-semibold text-white/55 hover:bg-white/[.05]"><Archive className="size-4" /> Arquivar</button></div>
      </header>

      {saveNotice && <div className="border-b border-emerald-300/10 bg-emerald-300/[.06] px-5 py-2 text-center text-[10px] font-semibold text-emerald-100/80">{saveNotice}</div>}

      <div className="grid min-h-0 xl:grid-cols-[220px_390px_minmax(0,1fr)]">
        <aside className="border-b border-white/[.06] bg-black/10 p-3 xl:border-b-0 xl:border-r">
          <div className="flex gap-2"><button type="button" onClick={() => setShowArchived(false)} className={cn("flex-1 rounded-xl border px-3 py-2.5 text-[10px] font-semibold", !showArchived ? "border-cyan-300/20 bg-cyan-300/[.07] text-cyan-50" : "border-white/[.06] text-white/35")}>Ativos {activeCount}</button><button type="button" onClick={() => setShowArchived(true)} className={cn("flex-1 rounded-xl border px-3 py-2.5 text-[10px] font-semibold", showArchived ? "border-cyan-300/20 bg-cyan-300/[.07] text-cyan-50" : "border-white/[.06] text-white/35")}>Arquivo {archivedCount}</button></div>
          <div className="mt-3 max-h-[260px] space-y-1.5 overflow-y-auto xl:max-h-[calc(100dvh-285px)]">
            {!hydrated ? <div className="h-16 animate-pulse rounded-xl bg-white/[.025]" /> : visibleProjects.length === 0 ? <div className="rounded-xl border border-dashed border-white/[.08] p-4 text-center text-[10px] text-white/28">Nenhum projeto aqui.</div> : visibleProjects.map((project) => <button key={project.id} type="button" onClick={() => openProject(project)} className={cn("w-full rounded-xl border p-3 text-left transition", currentId === project.id ? "border-cyan-300/20 bg-cyan-300/[.06]" : "border-white/[.05] bg-white/[.018] hover:bg-white/[.035]")}><div className="flex items-center gap-2"><FolderOpen className="size-4 shrink-0 text-cyan-200/45" /><strong className="truncate text-xs text-white/70">{project.name}</strong></div><p className="mt-1 truncate text-[9px] text-white/24">{project.draft.mode === "app" ? "Mini-app" : "Site"} · {project.draft.segment}</p></button>)}
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-white/20">Os projetos são persistidos neste navegador. Exportar HTML continua disponível para cópia externa.</p>
        </aside>

        <section className="border-b border-white/[.06] p-4 xl:border-b-0 xl:border-r xl:p-5">
          <label className="block text-[10px] font-semibold uppercase tracking-[.14em] text-white/28">Nome do projeto<input value={projectName} onChange={(event) => setProjectName(event.target.value)} className={`${fieldClass()} mt-2`} /></label>
          <div className="mt-4 grid grid-cols-2 gap-2">{MODE_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => { updateDraft("mode", option.value); setPreviewPage(option.value === "app" ? "app" : "home"); }} className={cn("rounded-2xl border p-3 text-left transition", draft.mode === option.value ? "border-cyan-300/25 bg-cyan-300/[.07]" : "border-white/[.07] bg-white/[.02]")}><span className="flex items-center gap-2 text-xs font-semibold">{option.value === "app" ? <Smartphone className="size-4" /> : <Globe2 className="size-4" />}{option.label}</span><span className="mt-1 block text-[10px] leading-relaxed text-white/30">{option.description}</span></button>)}</div>
          <div className="mt-4 grid gap-3"><Field label="Empresa" value={draft.businessName} onChange={(value) => updateDraft("businessName", value)} /><Field label="Segmento" value={draft.segment} onChange={(value) => updateDraft("segment", value)} /><Field label="Oferta principal" value={draft.offer} onChange={(value) => updateDraft("offer", value)} /><Field label="Objetivo comercial" value={draft.goal} onChange={(value) => updateDraft("goal", value)} /><div className="grid grid-cols-2 gap-2"><Field label="Local" value={draft.location} onChange={(value) => updateDraft("location", value)} /><Field label="Botão" value={draft.cta} onChange={(value) => updateDraft("cta", value)} /></div><div className="grid grid-cols-2 gap-2"><Field label="WhatsApp" value={draft.whatsapp} placeholder="+351..." onChange={(value) => updateDraft("whatsapp", value)} /><Field label="Google Maps" value={draft.mapsQuery} onChange={(value) => updateDraft("mapsQuery", value)} /></div></div>
          <div className="mt-4 flex flex-wrap gap-2">{TONE_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => updateDraft("tone", option.value)} className={cn("rounded-full border px-3 py-2 text-[10px] font-semibold", draft.tone === option.value ? "border-blue-400 bg-blue-500/20 text-white" : "border-white/[.07] text-white/35")}>{option.label}</button>)}</div>
          <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => openHtmlPreview(html)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] text-xs font-semibold text-white/60 hover:bg-white/[.05]"><ExternalLink className="size-4" /> Abrir preview</button><button type="button" onClick={() => downloadHtml(html, filename)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-semibold text-white"><Download className="size-4" /> Exportar HTML</button></div>
          <div className="mt-5 grid gap-2 text-[10px] text-white/35">{[{ icon: LayoutTemplate, label: "Preview", value: draft.mode === "app" ? "Site + mini-app" : "Site responsivo" },{ icon: FileCode2, label: "Arquivo", value: filename },{ icon: MessageCircle, label: "WhatsApp", value: draft.whatsapp ? "Configurado no projeto" : "Pendente" },{ icon: MapPinned, label: "Maps", value: draft.mapsQuery ? "Configurado" : "Pendente" },{ icon: ShieldCheck, label: "Persistência", value: "Salvo localmente no navegador" }].map((item) => <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/[.05] bg-white/[.018] p-3"><item.icon className="size-4 shrink-0 text-cyan-200/45" /><div className="min-w-0"><strong className="block text-white/55">{item.label}</strong><span className="block truncate">{item.value}</span></div></div>)}</div>
        </section>

        <section className="flex min-h-[560px] flex-col bg-[#03080e] p-3 sm:p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-cyan-300/60">Preview navegável</p><h3 className="mt-1 text-sm font-semibold">{projectName || draft.businessName}</h3></div><div className="flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-white/[.04] p-1">{previewPages.map((page) => <button key={page.id} type="button" onClick={() => setPreviewPage(page.id)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-[9px] font-semibold", previewPage === page.id ? "bg-white text-slate-950" : "text-white/45")}>{page.label}</button>)}</div></div>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-white/10 bg-white shadow-[0_28px_80px_rgba(0,0,0,.35)]"><iframe key={`${currentId}-${previewPage}-${draft.tone}-${draft.mode}`} title="Preview navegável do site" srcDoc={srcDoc} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="h-full min-h-[540px] w-full bg-white" /></div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-400/[.07] px-3 py-2 text-[10px] text-emerald-100/70"><Rocket className="size-4 shrink-0" />Alterações aparecem imediatamente no preview. Salve para manter a versão neste navegador.</div>
        </section>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="flex flex-col gap-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-white/25">{label}<input className={fieldClass()} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}
