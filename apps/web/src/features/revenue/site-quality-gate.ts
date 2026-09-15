export type SiteQualityInput = {
  usesRealBusinessData: boolean;
  hasOriginalConcept: boolean;
  responsive: boolean;
  accessible: boolean;
  reducedMotion: boolean;
  optimizedMedia: boolean;
  hasClearPrimaryCta: boolean;
  hasProof: boolean;
  hasFakeContent: boolean;
  brokenLinks: number;
  consoleErrors: number;
  lighthouse?: { performance?: number; accessibility?: number; bestPractices?: number; seo?: number };
};

export type SiteQualityResult = { passed: boolean; score: number; blockers: string[]; warnings: string[] };

export function evaluatePremiumSite(input: SiteQualityInput): SiteQualityResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!input.usesRealBusinessData) blockers.push("Site is not grounded in verified business data");
  if (!input.hasOriginalConcept) blockers.push("No original creative concept");
  if (input.hasFakeContent) blockers.push("Fake testimonials, metrics, awards or business facts detected");
  if (!input.responsive) blockers.push("Responsive/mobile experience incomplete");
  if (!input.accessible) blockers.push("Accessibility requirements incomplete");
  if (input.brokenLinks > 0) blockers.push(`${input.brokenLinks} broken link(s)`);
  if (input.consoleErrors > 0) blockers.push(`${input.consoleErrors} console/runtime error(s)`);
  if (!input.reducedMotion) warnings.push("Reduced-motion behavior missing");
  if (!input.optimizedMedia) warnings.push("Media optimization incomplete");
  if (!input.hasClearPrimaryCta) warnings.push("Primary conversion CTA is unclear");
  if (!input.hasProof) warnings.push("Commercial proof is weak or missing");

  const lighthouse = input.lighthouse;
  if (lighthouse?.performance !== undefined && lighthouse.performance < 80) warnings.push("Performance score below premium target (80)");
  if (lighthouse?.accessibility !== undefined && lighthouse.accessibility < 90) warnings.push("Accessibility score below target (90)");
  if (lighthouse?.bestPractices !== undefined && lighthouse.bestPractices < 90) warnings.push("Best Practices score below target (90)");
  if (lighthouse?.seo !== undefined && lighthouse.seo < 85) warnings.push("SEO score below target (85)");

  const score = Math.max(0, 100 - blockers.length * 20 - warnings.length * 5);
  return { passed: blockers.length === 0 && score >= 80, score, blockers, warnings };
}
