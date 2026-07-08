import { OpportunityCategory } from "../../domain";
import { OPPORTUNITY_CATEGORIES } from "../../shared";

export const OPPORTUNITY_CATEGORY_CATALOG: OpportunityCategory[] = OPPORTUNITY_CATEGORIES.map(
  (cat) =>
    OpportunityCategory.create({
      key: cat.key,
      label: cat.label,
      description: `Oportunidades de ${cat.label}`,
    }),
);
