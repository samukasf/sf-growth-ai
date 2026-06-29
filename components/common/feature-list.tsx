import { CheckIcon } from "@/components/ui/check-icon";

type FeatureListProps = {
  items: readonly string[];
};

export function FeatureList({ items }: FeatureListProps) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
          <CheckIcon />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
