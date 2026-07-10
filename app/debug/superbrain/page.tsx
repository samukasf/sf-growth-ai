"use client";

import { useState } from "react";

import type { RuntimeResponse, SuperbrainPipelineStep } from "@/apps/web/src/core/superbrain";

const DEFAULT_QUERY = "Analise minha empresa.";

function StepBadge({ step }: { step: SuperbrainPipelineStep }) {
  const colors: Record<string, string> = {
    success: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    skipped: "text-zinc-400 border-zinc-500/30 bg-zinc-500/10",
    failed: "text-red-400 border-red-500/30 bg-red-500/10",
    running: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    pending: "text-zinc-500 border-zinc-600/30 bg-zinc-600/10",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${colors[step.status] ?? colors.pending}`}
    >
      {step.status}
    </span>
  );
}

export default function SuperbrainDebugPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RuntimeResponse | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/superbrain/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setResult(data as RuntimeResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-muted">Debug · Supercérebro</p>
          <h1 className="text-3xl font-semibold">First End-to-End Runtime</h1>
          <p className="text-muted">
            Vertical slice sem LLM — Memory, Context, Company Brain, Council, Decision.
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="query">
            Input
          </label>
          <textarea
            id="query"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            rows={3}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            onClick={handleRun}
            disabled={loading || !query.trim()}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Executando…" : "Executar"}
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </section>

        {result ? (
          <>
            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pipeline</h2>
                <span className="text-sm text-muted">
                  Total: {result.totalDurationMs}ms · Confiança: {result.confidence}%
                </span>
              </div>
              <div className="space-y-2">
                {result.pipeline.map((step) => (
                  <div
                    key={step.name}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-xs text-muted">{step.name}</code>
                      <StepBadge step={step} />
                    </div>
                    <span className="font-mono text-xs text-muted">{step.durationMs}ms</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Summary</h2>
              <p className="text-sm leading-relaxed text-muted">{result.summary}</p>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <h2 className="text-lg font-semibold">Sections</h2>
                {result.sections.map((section) => (
                  <div key={section.id} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-medium">{section.title}</p>
                    <p className="text-xs text-muted">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <h2 className="text-lg font-semibold">Recommendations</h2>
                {result.recommendations.map((rec) => (
                  <div key={rec.id} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-medium">
                      [{rec.priority}] {rec.title}
                    </p>
                    <p className="text-xs text-muted">{rec.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <h2 className="text-lg font-semibold">Risks</h2>
                {result.risks.map((risk) => (
                  <div key={risk.id} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-medium text-red-300">
                      [{risk.severity}] {risk.title}
                    </p>
                    <p className="text-xs text-muted">{risk.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <h2 className="text-lg font-semibold">Opportunities</h2>
                {result.opportunities.map((opp) => (
                  <div key={opp.id} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-medium text-emerald-300">
                      [{opp.impact}] {opp.title}
                    </p>
                    <p className="text-xs text-muted">{opp.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold">Next Actions</h2>
              <ul className="space-y-2">
                {result.nextActions.map((action) => (
                  <li
                    key={action.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
                  >
                    <span>{action.title}</span>
                    <span className="text-xs text-muted">
                      {action.owner} · {action.deadline}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">Raw RuntimeResponse</h2>
              <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-muted">
                {JSON.stringify(result, null, 2)}
              </pre>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
