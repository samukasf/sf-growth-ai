type FieldListProps = {
  fields: Array<{ id: string; label: string; value: string }>;
};

export function FieldList({ fields }: FieldListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {fields.map((field) => (
        <li
          key={field.id}
          className="rounded-lg border border-border bg-white/[0.02] px-3 py-2.5"
        >
          <span className="text-xs text-muted">{field.label}</span>
          <p className="mt-0.5 text-sm text-foreground">{field.value}</p>
        </li>
      ))}
    </ul>
  );
}
