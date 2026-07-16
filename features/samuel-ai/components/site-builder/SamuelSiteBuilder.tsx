"use client";

import { useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  FileCode2,
  Globe2,
  LayoutTemplate,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/utils/cn";

import { CommandPanel } from "../shared/command-panel";
import { SectionHeader } from "../section-header";
import {
  buildSiteBuilderFilename,
  buildSiteBuilderHtml,
  type SiteBuilderDraft,
  type SiteBuilderTone,
} from "./site-builder-preview";

type SamuelSiteBuilderProps = {
  companyName?: string;
  companySegment?: string;
  companyLocation?: string;
};

type PreviewPage = "home" | "services" | "contact";

const TONE_OPTIONS: Array<{ value: SiteBuilderTone; label: string }> = [
  { value: "executive", label: "Tecnológico" },
  { value: "premium", label: "Premium" },
  { value: "local", label: "Local" },
];

const PREVIEW_PAGES: Array<{ id: PreviewPage; label: string; hash: string }> = [
  { id: "home", label: "Início", hash: "#home" },
  { id: "services", label: "Serviços", hash: "#services" },
  { id: "contact", label: "Contato", hash: "#contact" },
];

function fieldClass() {
  return "w-full rounded-2xl border border-blue-950/10 bg-white/90 px-3.5 py-3 text-sm text-blue-950 outline-none transition placeholder:text-blue-950/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10";
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

export function SamuelSiteBuilder({
  companyName = "A sua empresa",
  companySegment = "serviços profissionais",
  companyLocation = "Portugal",
}: SamuelSiteBuilderProps) {
  const [draft, setDraft] = useState<SiteBuilderDraft>({
    businessName: companyName,
    segment: companySegment,
    offer: "Presença digital profissional para vender mais",
    goal: "receber pedidos de orçamento qualificados",
    location: companyLocation,
    cta: "Pedir orçamento",
    tone: "executive",
  });
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");

  const html = useMemo(() => buildSiteBuilderHtml(draft), [draft]);
  const filename = useMemo(() => buildSiteBuilderFilename(draft), [draft]);
  const srcDoc = useMemo(() => makeSrcDoc(html, previewPage), [html, previewPage]);

  const updateDraft = <Key extends keyof SiteBuilderDraft>(
    key: Key,
    value: SiteBuilderDraft[Key],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4 pb-20 lg:pb-4">
      <CommandPanel accent className="overflow-hidden p-0">
        <div className="grid gap-0 xl:grid-cols-[0.88fr_1.12fr]">
          <section className="border-b border-blue-950/10 bg-white/86 p-4 sm:p-5 xl:border-b-0 xl:border-r">
            <div className="mb-5 flex items-start justify-between gap-4">
              <SectionHeader
                title="Criador de Sites"
                description="Gere, visualize e exporte uma primeira versão navegável"
              />
              <span className="hidden rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-500 sm:flex">
                <Globe2 className="size-5" />
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-950/45">
                Empresa
                <input
                  className={fieldClass()}
                  value={draft.businessName}
                  onChange={(event) => updateDraft("businessName", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-950/45">
                Segmento
                <input
                  className={fieldClass()}
                  value={draft.segment}
                  onChange={(event) => updateDraft("segment", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-950/45 sm:col-span-2">
                Oferta principal
                <input
                  className={fieldClass()}
                  value={draft.offer}
                  onChange={(event) => updateDraft("offer", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-950/45 sm:col-span-2">
                Objetivo comercial
                <input
                  className={fieldClass()}
                  value={draft.goal}
                  onChange={(event) => updateDraft("goal", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-950/45">
                Local
                <input
                  className={fieldClass()}
                  value={draft.location}
                  onChange={(event) => updateDraft("location", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-950/45">
                Botão
                <input
                  className={fieldClass()}
                  value={draft.cta}
                  onChange={(event) => updateDraft("cta", event.target.value)}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {TONE_OPTIONS.map((option) => {
                const active = draft.tone === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateDraft("tone", option.value)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs font-semibold transition",
                      active
                        ? "border-blue-500 bg-blue-600 text-white shadow-[0_12px_26px_rgba(37,99,235,.2)]"
                        : "border-blue-950/10 bg-white text-blue-950/55 hover:border-blue-300 hover:text-blue-700",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => openHtmlPreview(html)}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-blue-950/10 bg-white px-4 text-sm font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <ExternalLink className="size-4" />
                Abrir preview
              </button>
              <button
                type="button"
                onClick={() => downloadHtml(html, filename)}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(37,99,235,.25)] transition hover:brightness-105"
              >
                <Download className="size-4" />
                Exportar HTML
              </button>
            </div>

            <div className="mt-5 grid gap-2 text-xs text-blue-950/58">
              {[
                { icon: LayoutTemplate, label: "Preview navegável", value: "Início, Serviços e Contato" },
                { icon: FileCode2, label: "Entrega", value: filename },
                { icon: ShieldCheck, label: "Segurança", value: "Texto isolado e sanitizado" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-blue-950/8 bg-blue-50/70 p-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-white text-blue-600">
                    <item.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-blue-950">{item.label}</b>
                    <span className="block truncate">{item.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-[620px] flex-col bg-slate-950 p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/80">
                  Painel de preview
                </p>
                <h2 className="mt-1 text-base font-semibold text-white">Site navegável</h2>
              </div>
              <div className="flex rounded-full border border-white/10 bg-white/8 p-1">
                {PREVIEW_PAGES.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => setPreviewPage(page.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                      previewPage === page.id ? "bg-white text-slate-950" : "text-white/60 hover:text-white",
                    )}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-[0_28px_80px_rgba(0,0,0,.35)]">
              <iframe
                key={`${previewPage}-${draft.tone}`}
                title="Preview navegável do site"
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                className="h-full min-h-[560px] w-full bg-white"
              />
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100">
              <Rocket className="size-4 shrink-0" />
              <span className="min-w-0 truncate">Preview gerado localmente e pronto para validação visual.</span>
            </div>
          </section>
        </div>
      </CommandPanel>
    </div>
  );
}
