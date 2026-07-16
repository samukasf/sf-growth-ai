import Link from "next/link";

type IntegrationEmptyStateProps = {
  title: string;
  description: string;
  envVars?: string[];
  connectHref?: string;
  connectLabel?: string;
  docsNote?: string;
};

export function IntegrationEmptyState({
  title,
  description,
  envVars = [],
  connectHref,
  connectLabel = "Configurar integração",
  docsNote,
}: IntegrationEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-black/10 px-4 py-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{description}</p>

      {envVars.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Variáveis necessárias
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {envVars.map((name) => (
              <li
                key={name}
                className="rounded-md border border-border/60 bg-black/20 px-2 py-0.5 font-mono text-[10px] text-foreground/80"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {docsNote ? <p className="mt-3 text-[11px] text-muted">{docsNote}</p> : null}

      {connectHref ? (
        <Link
          href={connectHref}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent-hover"
        >
          {connectLabel}
        </Link>
      ) : null}
    </div>
  );
}
