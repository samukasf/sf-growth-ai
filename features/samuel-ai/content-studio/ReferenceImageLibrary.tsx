"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";

import { cn } from "@/utils/cn";

export type StudioReferenceImage = {
  assetPath: string;
  name: string;
  previewUrl: string;
  mimeType?: string | null;
  size?: number | null;
  createdAt?: string | null;
};

type Props = {
  companyId: string;
  onReferencesChange?: (references: StudioReferenceImage[]) => void;
  compact?: boolean;
};

function selectionKey(companyId: string) {
  return `sf-growth-ai:studio:references:${companyId}`;
}

function readStoredSelection(companyId: string) {
  try {
    const stored = sessionStorage.getItem(selectionKey(companyId));
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, 12)
      : [];
  } catch {
    return [];
  }
}

export function ReferenceImageLibrary({ companyId, onReferencesChange, compact = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<StudioReferenceImage[]>([]);
  const [selected, setSelected] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readStoredSelection(companyId),
  );
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelected(readStoredSelection(companyId));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [companyId]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/samuel-ai/content-studio/references?companyId=${encodeURIComponent(companyId)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({})) as { references?: StudioReferenceImage[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Falha ao carregar referências.");
        setItems(payload.references ?? []);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Falha ao carregar referências.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [companyId]);

  useEffect(() => {
    const active = items.filter((item) => selected.includes(item.assetPath));
    const urls = active.map((item) => item.previewUrl);
    onReferencesChange?.(active);
    try {
      sessionStorage.setItem(selectionKey(companyId), JSON.stringify(selected));
      sessionStorage.setItem(`${selectionKey(companyId)}:urls`, JSON.stringify(urls));
      sessionStorage.setItem("sf-growth-ai:studio:active-reference-urls", JSON.stringify(urls));
    } catch {
      // Session storage is only an optimization for cross-tab continuity.
    }
    window.dispatchEvent(new CustomEvent("samuel:studio-reference-change", { detail: { companyId, references: active } }));
  }, [companyId, items, onReferencesChange, selected]);

  function toggle(item: StudioReferenceImage) {
    setSelected((current) => current.includes(item.assetPath)
      ? current.filter((path) => path !== item.assetPath)
      : current.length >= 12 ? current : [...current, item.assetPath]);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: StudioReferenceImage[] = [];
      for (const file of Array.from(files).slice(0, 12)) {
        const form = new FormData();
        form.set("companyId", companyId);
        form.set("file", file);
        const response = await fetch("/api/samuel-ai/content-studio/references", { method: "POST", body: form });
        const payload = await response.json().catch(() => ({})) as { reference?: StudioReferenceImage; error?: string };
        if (!response.ok || !payload.reference) throw new Error(payload.error || `Falha ao enviar ${file.name}.`);
        uploaded.push(payload.reference);
      }
      setItems((current) => [...uploaded, ...current]);
      setSelected((current) => [...new Set([...current, ...uploaded.map((item) => item.assetPath)])].slice(0, 12));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao enviar imagens.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
      setUploading(false);
    }
  }

  async function remove(item: StudioReferenceImage) {
    if (!window.confirm(`Remover “${item.name}” da biblioteca de referências?`)) return;
    setError(null);
    const response = await fetch("/api/samuel-ai/content-studio/references", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, assetPath: item.assetPath }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Falha ao remover referência.");
      return;
    }
    setItems((current) => current.filter((candidate) => candidate.assetPath !== item.assetPath));
    setSelected((current) => current.filter((path) => path !== item.assetPath));
  }

  return (
    <section className={cn("rounded-2xl border border-cyan-300/10 bg-[#06121f]", compact ? "p-3" : "p-4")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white"><ImagePlus className="size-4 text-cyan-300" />Imagens de referência</div>
          <p className="mt-1 text-[11px] leading-5 text-white/42">Envie produto, equipa, ambiente, marca ou fotos próprias. As selecionadas ficam ativas em todo o Studio e entram na montagem do vídeo.</p>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-3 text-[11px] font-semibold text-cyan-50 hover:bg-cyan-300/[.11] disabled:opacity-50">
          {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {uploading ? "Enviando…" : "Adicionar imagens"}
        </button>
        <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void uploadFiles(event.target.files)} />
      </div>

      {loading ? <div className="mt-4 flex items-center gap-2 text-xs text-white/35"><LoaderCircle className="size-4 animate-spin" />Carregando biblioteca…</div> : null}
      {!loading && items.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-white/32">Nenhuma referência ainda. JPG, PNG ou WebP até 8 MB.</div> : null}

      {items.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
          {items.map((item) => {
            const active = selected.includes(item.assetPath);
            return (
              <article key={item.assetPath} className={cn("group relative overflow-hidden rounded-xl border bg-black/20", active ? "border-cyan-300/55 ring-1 ring-cyan-300/25" : "border-white/[.07]")}> 
                <button type="button" className="block aspect-square w-full overflow-hidden" onClick={() => toggle(item)} title={active ? "Remover da seleção" : "Usar no vídeo"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                  <span className={cn("absolute left-2 top-2 flex size-6 items-center justify-center rounded-full border backdrop-blur", active ? "border-cyan-200/45 bg-cyan-400/25 text-white" : "border-white/15 bg-black/35 text-white/50")}>{active ? <Check className="size-3.5" /> : null}</span>
                </button>
                <div className="flex items-center gap-1 p-2"><span className="min-w-0 flex-1 truncate text-[9px] text-white/45">{item.name}</span><button type="button" aria-label={`Remover ${item.name}`} onClick={() => void remove(item)} className="flex size-7 shrink-0 items-center justify-center rounded-lg text-white/28 hover:bg-red-400/10 hover:text-red-200"><Trash2 className="size-3.5" /></button></div>
              </article>
            );
          })}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[.12em] text-white/28"><span>{selected.length} selecionada(s)</span><span>máximo 12 por projeto</span></div>
      {error ? <p className="mt-3 rounded-xl border border-red-400/15 bg-red-400/[.05] p-3 text-xs text-red-100/80">{error}</p> : null}
    </section>
  );
}
