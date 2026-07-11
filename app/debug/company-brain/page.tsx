import {
  createSampleDiscoveryResult,
  getCompanyBrainService,
  presentCompanyBrain,
} from "@/apps/web/src/core/company-brain";

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-2 text-zinc-300">
        {items.map((item) => (
          <li key={item} className="list-disc ml-5">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function CompanyBrainDebugPage() {
  const discovery = createSampleDiscoveryResult();
  const service = getCompanyBrainService();
  const brain = await service.build({ discovery });
  const presentation = presentCompanyBrain(brain, discovery);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-zinc-500">Debug</p>
          <h1 className="mt-2 text-4xl font-bold">Company Brain Builder</h1>
          <p className="mt-3 text-zinc-400">
            Estrutura oficial do conhecimento empresarial derivada do Discovery.
          </p>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-semibold">Resumo Executivo</h2>
          <p className="mt-4 text-lg text-zinc-200">{presentation.executiveSummary.headline}</p>
          <p className="mt-3 text-zinc-300">{presentation.executiveSummary.overview}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-zinc-200">Insights</h3>
              <ul className="mt-3 space-y-2 text-zinc-400">
                {presentation.executiveSummary.keyInsights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-zinc-200">Ações prioritárias</h3>
              <ul className="mt-3 space-y-2 text-zinc-400">
                {presentation.executiveSummary.priorityActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <ListSection title="SWOT — Strengths" items={presentation.swot.strengths} />
          <ListSection title="SWOT — Weaknesses" items={presentation.swot.weaknesses} />
          <ListSection title="SWOT — Opportunities" items={presentation.swot.opportunities} />
          <ListSection title="SWOT — Threats" items={presentation.swot.threats} />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Scores</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ScoreCard label="Knowledge Score" value={presentation.scores.knowledgeScore} />
            <ScoreCard label="Completeness Score" value={presentation.scores.completenessScore} />
            <ScoreCard label="Confidence Score" value={presentation.scores.confidenceScore} />
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-semibold">Timeline</h2>
          <div className="mt-6 space-y-4">
            {presentation.timeline.map((entry) => (
              <div key={entry.id} className="border-l-2 border-zinc-700 pl-4">
                <p className="text-sm text-zinc-500">{new Date(entry.date).toLocaleString()}</p>
                <p className="font-medium text-zinc-200">{entry.label}</p>
                <p className="text-zinc-400">{entry.description}</p>
              </div>
            ))}
          </div>
        </section>

        <ListSection title="Recomendações" items={presentation.recommendations} />
      </div>
    </main>
  );
}
