import {
  createSampleDiscoveryResult,
  getCompanyBrainService,
  InMemoryTimelineRepository,
  presentCompanyBrain,
  presentTimelineGroupsForViewer,
  TimelineService,
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

function ImportanceBadge({ importance }: { importance: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-500/10 text-red-400 ring-red-500/20",
    high: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    medium: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
    low: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset ${styles[importance] ?? styles.low}`}
    >
      {importance}
    </span>
  );
}

export default async function CompanyBrainDebugPage() {
  const discovery = createSampleDiscoveryResult();
  const service = getCompanyBrainService();
  const timelineService = new TimelineService(new InMemoryTimelineRepository());
  const brain = await service.build({ discovery });
  await timelineService.seedFromCompanyBrain(brain, discovery);

  const presentation = presentCompanyBrain(brain, discovery);
  const timelineEvents = await timelineService.list({
    tenantId: brain.organizationId,
    companyId: brain.companyId,
  });
  const timelineSummary = await timelineService.summarize({
    tenantId: brain.organizationId,
    companyId: brain.companyId,
  });
  const timelineView = presentTimelineGroupsForViewer(
    timelineEvents,
    timelineSummary,
  );

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-zinc-500">Debug</p>
          <h1 className="mt-2 text-4xl font-bold">Company Brain Viewer</h1>
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Timeline</h2>
              <p className="mt-2 text-zinc-400">{timelineView.summary.headline}</p>
            </div>
            <p className="text-sm text-zinc-500">{timelineView.total} eventos</p>
          </div>

          {timelineView.summary.highlights.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-zinc-400">
              {timelineView.summary.highlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          )}

          <div className="mt-8 space-y-8">
            {timelineView.groups.map((group) => (
              <div key={group.key}>
                <h3 className="text-lg font-semibold text-zinc-200">{group.label}</h3>
                {group.events.length === 0 ? (
                  <p className="mt-3 text-sm text-zinc-500">Nenhum evento neste período.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {group.events.map((event) => (
                      <div
                        key={event.id}
                        className="border-l-2 border-zinc-700 pl-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm text-zinc-500">{event.formattedDate}</p>
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                            {event.type}
                          </span>
                          <ImportanceBadge importance={event.importance} />
                        </div>
                        <p className="mt-1 font-medium text-zinc-200">{event.title}</p>
                        <p className="text-zinc-400">{event.description}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {event.source} · {event.createdBy}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <ListSection title="Recomendações" items={presentation.recommendations} />
      </div>
    </main>
  );
}
