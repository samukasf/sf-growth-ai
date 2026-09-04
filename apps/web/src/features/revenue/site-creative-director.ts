export type SiteVertical = "restaurant" | "hotel" | "construction" | "professional_services" | "wellness" | "retail" | "generic";

export type SiteReference = {
  name: string;
  url: string;
  verticals: SiteVertical[];
  lessons: string[];
};

// References are inspiration inputs, never templates to copy.
export const PREMIUM_SITE_REFERENCES: SiteReference[] = [
  { name: "SiteInspire — Cafés, Bars & Restaurants", url: "https://www.siteinspire.com/websites/category/cafes-bars-and-restaurants", verticals: ["restaurant"], lessons: ["editorial food photography", "strong typography", "menu integrated into brand story", "intentional whitespace"] },
  { name: "SiteInspire — Hotels & Venues", url: "https://www.siteinspire.com/websites/category/hotels-and-venues", verticals: ["hotel"], lessons: ["cinematic hero", "immersive storytelling", "room/experience hierarchy", "high-value booking CTA"] },
  { name: "SiteInspire — Luxury", url: "https://www.siteinspire.com/websites/category/luxury", verticals: ["hotel", "retail", "wellness", "professional_services", "generic"], lessons: ["restraint", "art direction", "premium typography", "large-format imagery", "micro-interactions"] },
  { name: "SiteInspire — Web & Interactive Design", url: "https://www.siteinspire.com/websites/category/web-and-interactive-design", verticals: ["construction", "professional_services", "generic"], lessons: ["modern interaction", "non-template composition", "motion with purpose", "clear information architecture"] },
];

export type PremiumSiteBrief = {
  companyName: string;
  vertical: SiteVertical;
  language: string;
  audience: string;
  primaryGoal: string;
  differentiators: string[];
  proof: string[];
  offer?: string;
  location?: string;
  availableAssets: string[];
};

export function buildPremiumSiteDirection(brief: PremiumSiteBrief) {
  const references = PREMIUM_SITE_REFERENCES.filter((ref) => ref.verticals.includes(brief.vertical) || ref.verticals.includes("generic"));
  return {
    qualityBar: "bespoke-agency",
    references,
    nonNegotiables: [
      "Create an original concept from the real business strategy; never clone a reference.",
      "No generic SaaS/template hero, random gradients, fake awards, fake reviews or invented metrics.",
      "Use real brand/business data. Mark missing assets/content explicitly instead of inventing them.",
      "Mobile-first composition with deliberate desktop art direction, not a stretched mobile layout.",
      "Strong typography hierarchy, controlled whitespace, consistent grid and premium image treatment.",
      "Motion must reinforce hierarchy and feedback; avoid decorative animation that hurts speed or usability.",
      "Every section must have a commercial purpose: desire, proof, objection handling, discovery or conversion.",
      "Accessible contrast, semantic structure, keyboard support and reduced-motion behavior.",
      "Optimize media and preserve Core Web Vitals; visual ambition cannot justify a slow experience.",
    ],
    requiredSections: selectSections(brief.vertical),
    brief,
  };
}

function selectSections(vertical: SiteVertical) {
  const common = ["navigation", "art-directed hero", "value proposition", "proof", "conversion CTA", "footer/contact"];
  const verticalSections: Record<SiteVertical, string[]> = {
    restaurant: ["signature dishes", "menu experience", "chef/story", "atmosphere gallery", "location/reservation"],
    hotel: ["property story", "rooms/suites", "experiences", "destination", "booking path"],
    construction: ["capabilities", "selected projects", "process", "before/after proof", "quote request"],
    professional_services: ["expertise", "cases/results", "method", "team/authority", "consultation CTA"],
    wellness: ["treatments/services", "experience", "practitioner trust", "benefits/proof", "booking"],
    retail: ["collection/product story", "featured products", "craft/material", "social proof", "purchase/store CTA"],
    generic: ["services", "selected work", "process", "proof", "contact"],
  };
  return [...common, ...verticalSections[vertical]];
}
