"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { DiscoveryResult } from "@/apps/web/src/core/discovery";
import {
  formatDuration,
  PIPELINE_DISPLAY_ORDER,
  PIPELINE_UI_LABELS,
  presentDiscovery,
} from "@/apps/web/src/core/discovery/discovery.presenter";

const DEFAULT_FORM = {
  companyName: "GrafGil Impressões",
  website: "grafgil.com.br",
  instagram: "grafgil",
  facebook: "grafgil",
  city: "São Paulo",
};

const STATIC_DISPLAY_STEPS = PIPELINE_DISPLAY_ORDER.map((key) => ({
  key,
  label: PIPELINE_UI_LABELS[key],
  durationMs: 0,
}));

export default function DiscoveryDebugPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [visibleStepCount, setVisibleStepCount] = useState(0);
  const animationRef = useRef<number | null>(null);

  const viewModel = result ? presentDiscovery(result) : null;
  const displaySteps = viewModel?.displaySteps ?? STATIC_DISPLAY_STEPS;

  const clearAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      window.clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(
    (stepCount: number) => {
      clearAnimation();
      setVisibleStepCount(1);

      animationRef.current = window.setInterval(() => {
        setVisibleStepCount((count) => {
          if (count >= stepCount) {
            clearAnimation();
            return count;
          }
          return count + 1;
        });
      }, 350);
    },
    [clearAnimation],
  );

  useEffect(() => () => clearAnimation(), [clearAnimation]);

  const handleRun = useCallback(async () => {
    clearAnimation();
    setLoading(true);
    setError(null);
    setResult(null);
    setVisibleStepCount(0);

    try {
      const response = await fetch("/api/discovery/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      const discoveryResult = data as DiscoveryResult;
      setResult(discoveryResult);
      startAnimation(presentDiscovery(discoveryResult).displaySteps.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [clearAnimation, form, startAnimation]);

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-muted">Debug · Discovery Engine</p>
          <h1 className="text-3xl font-semibold">Discovery Engine Runtime</h1>
          <p className="text-muted">
            Descobre informações da empresa e alimenta Company Brain, Memory e Context.
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
            onClick={handleRun}
            disabled={loading || !form.companyName.trim()}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Executando Discovery…" : "Executar Discovery"}
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </section>

        {loading || result ? (
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Pipeline</h2>
            <div className="space-y-2">
              {displaySteps.map((displayStep, index) => {
                const visible = loading ? index === 0 : index < visibleStepCount;
                const active = loading && index === 0;
                return (
                  <div
                    key={displayStep.key}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition ${
                      visible ? "border-border" : "border-border/40 opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={visible ? "text-emerald-400" : "text-muted"}>
                        {visible ? "✓" : active ? "…" : "○"}
                      </span>
                      <span>{displayStep.label}</span>
                    </div>
                    {result && visible ? (
                      <span className="font-mono text-xs text-muted">
                        {formatDuration(displayStep.durationMs)}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {result && viewModel && visibleStepCount >= viewModel.displaySteps.length ? (
          <>
            <section className="rounded-xl border border-border bg-card p-6 space-y-2">
              <h2 className="text-lg font-semibold">Resumo executivo</h2>
              <p className="text-sm text-muted">{result.executiveSummary}</p>
              <p className="text-xs text-muted">
                Confiança: {viewModel.confidenceLabel} · Tempo: {viewModel.durationLabel}
              </p>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              {(
                [
                  ["Strengths", result.strengths, "text-emerald-300"],
                  ["Weaknesses", result.weaknesses, "text-amber-300"],
                  ["Opportunities", result.opportunities, "text-blue-300"],
                  ["Risks", result.risks, "text-red-300"],
                ] as const
              ).map(([title, items, accent]) => (
                <div key={title} className="rounded-xl border border-border bg-card p-6 space-y-3">
                  <h2 className={`text-lg font-semibold ${accent}`}>{title}</h2>
                  {items.map((item) => (
                    <div key={item.id} className="border-b border-border pb-2 last:border-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted">{item.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <section className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold">Próximos passos</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {result.nextSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold">Informações ausentes</h2>
              {result.missingInformation.length === 0 ? (
                <p className="text-sm text-emerald-300">Nenhuma informação crítica ausente.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {result.missingInformation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
