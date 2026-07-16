export {
  buildLinkedInExecutive,
  type LinkedInExecutive,
  type LinkedInExecutiveInput,
  type LinkedInMetrics,
  type LinkedInPostPerformance,
  type LinkedInInsightItem,
  type LinkedInRecommendation,
} from "./services/linkedin-executive.service";

export { LinkedInExecutiveSummarySection } from "./components/linkedin-executive-summary-section";

export { buildLinkedInExecutiveForCompany } from "@/integrations/linkedin";
