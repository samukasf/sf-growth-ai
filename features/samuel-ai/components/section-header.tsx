type SectionHeaderProps = {
  title: string;
  description: string;
  headingLevel?: "h2" | "h3";
  kicker?: string;
};

export function SectionHeader({
  title,
  description,
  headingLevel = "h3",
  kicker,
}: SectionHeaderProps) {
  const Heading = headingLevel;

  return (
    <div>
      {kicker && (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
          {kicker}
        </p>
      )}
      <Heading className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </Heading>
      <p className="mt-0.5 text-xs text-muted">{description}</p>
    </div>
  );
}
