"use client";

import { useState } from "react";

import type { CompanyAnalysisRuntimeResponse } from "@/apps/web/src/features/company-analysis/company-analysis.types";
import {
  formatDuration,
  getPipelineStepLabel,
  presentCompanyAnalysis,
} from "@/apps/web/src/features/company-analysis/company-analysis.presenter";

const DEFAULT_COMPANY = "GrafGil Impressões";

function StepBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    skipped: "text-zinc-400 border-zinc-500/30 bg-zinc-500/10",
    failed: "text-red-400 border-red-500/30 bg-red-500/10",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${colors[status] ?? colors.skipped}`}
    >
      {status}
    </span>
  );
}

function ItemList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{ id: string; title: string; description: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
      <h2 className={`text-lg font-semibold ${accent ?? ""}`}>{title}</h2>
      {items.map((item) => (
        <div key={item.id} className="border-b border-border pb-3 last:border-0">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export default function CompanyAnalysisDebugPage() {
  const [companyName, setCompanyName] = useState(DEFAULT_COMPANY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompanyAnalysisRuntimeResponse | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/company/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setResult(data as CompanyAnalysisRuntimeResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const viewModel = result ? presentCompanyAnalysis(result) : null;

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-muted">Debug · Analisar Empresa</p>
          <h1 className="text-3xl font-semibold">Company Analysis Pipeline</h1>
          <p className="text-muted">
            Fluxo oficial: Orchestrator → Memory → Context → Brain → Council → Decision → Planner →
            Response.
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="company">
            Empresa
          </label>
          <input
            id="company"
            type="text"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !companyName.trim()}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Analisando…" : "Executar análise"}
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </section>

        {result && viewModel ? (
          <>
            <section className="rounded-xl border border-border bg-card p-6 space-y-2">
              <h2 className="text-lg font-semibold">{viewModel.headline}</h2>
              <p className="text-sm text-muted">{result.summary}</p>
              <p className="text-xs text-muted">
                Confiança: {viewModel.confidenceLabel} · Tempo total: {viewModel.durationLabel}
              </p>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Pipeline</h2>
              <div className="space-y-2">
                {result.pipeline.map((step) => (
                  <div
                    key={`${step.name}-${step.durationMs}`}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">{getPipelineStepLabel(step.name)}</span>
                      <code className="font-mono text-xs text-muted/70">{step.name}</code>
                      <StepBadge status={step.status} />
                    </div>
                    <span className="font-mono text-xs text-muted">
                      {formatDuration(step.durationMs)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <ItemList title="Strengths" items={result.strengths} accent="text-emerald-300" />
              <ItemList title="Weaknesses" items={result.weaknesses} accent="text-amber-300" />
              <ItemList title="Opportunities" items={result.opportunities} accent="text-blue-300" />
              <ItemList title="Risks" items={result.risks} accent="text-red-300" />
            </div>

            <section className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold">Recommendations</h2>
              {result.recommendations.map((rec) => (
                <div key={rec.id} className="border-b border-border pb-3 last:border-0">
                  <p className="text-sm font-medium">
                    [{rec.priority}] {rec.title}
                  </p>
                  <p className="text-xs text-muted">{rec.description}</p>
                </div>
              ))}
            </section>

            <section className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold">Priority Actions</h2>
              <ul className="space-y-2">
                {result.priorityActions.map((action) => (
                  <li
                    key={action.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
                  >
                    <span>
                      {action.order}. {action.title}
                    </span>
                    <span className="text-xs text-muted">
                      {action.owner} · {action.deadline}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
