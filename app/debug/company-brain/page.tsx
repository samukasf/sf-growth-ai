"use client";

import { useCallback, useState } from "react";

import type { CompanyBrainBuildResponse } from "@/apps/web/src/core/company-brain";
import { presentCompanyBrain } from "@/apps/web/src/core/company-brain/company-brain.presenter";

const DEFAULT_FORM = {
  companyName: "GrafGil Impressões",
  website: "grafgil.com.br",
  instagram: "grafgil",
  facebook: "grafgil",
  city: "São Paulo",
};

export default function CompanyBrainDebugPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompanyBrainBuildResponse | null>(null);

  const viewModel = result
    ? presentCompanyBrain(result.companyBrain, result.summary)
    : null;

  const handleBuild = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/company-brain/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setResult(data as CompanyBrainBuildResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-muted">Debug · Company Brain Builder</p>
          <h1 className="text-3xl font-semibold">Company Brain Builder</h1>
          <p className="text-muted">
            Transforma o resultado do Discovery em conhecimento estruturado da empresa.
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Nome da empresa</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Website</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Instagram</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Facebook</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              />
            </label>
            <label className="block space-y-1 text-sm md:col-span-2">
              <span className="font-medium">Cidade</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleBuild}
            disabled={loading || !form.companyName.trim()}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Construindo Company Brain…" : "Construir Company Brain"}
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </section>

        {result && viewModel ? (
          <>
            <section className="rounded-xl border border-border bg-card p-6 space-y-2">
              <h2 className="text-lg font-semibold">Resumo Executivo</h2>
              <p className="text-sm text-muted">{viewModel.executiveSummary}</p>
              <p className="text-xs text-muted">Confiança: {viewModel.confidenceLabel}</p>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Scores</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {viewModel.scores.map((score) => (
                  <div key={score.key} className="rounded-lg border border-border px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-muted">{score.label}</p>
                    <p className="text-2xl font-semibold">{score.formatted}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              {viewModel.swotSections.map((section) => (
                <div key={section.key} className="rounded-xl border border-border bg-card p-6 space-y-3">
                  <h2 className={`text-lg font-semibold ${section.accent}`}>{section.title}</h2>
                  {section.items.map((item) => (
                    <div key={item.id} className="border-b border-border pb-2 last:border-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted">{item.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <section className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold">Timeline</h2>
              {viewModel.timeline.map((event) => (
                <div key={event.id} className="border-b border-border pb-3 last:border-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">{event.title}</p>
                    <span className="text-xs text-muted">{event.type}</span>
                  </div>
                  <p className="text-xs text-muted">{event.description}</p>
                  <p className="text-xs text-muted">{new Date(event.occurredAt).toLocaleString()}</p>
                </div>
              ))}
            </section>

            <section className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold">Recomendações</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {viewModel.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
