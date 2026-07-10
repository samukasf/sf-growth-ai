export type DiscoverySourceType =
  | "WEBSITE"
  | "GOOGLE_BUSINESS"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "LINKEDIN"
  | "MANUAL_INPUT"
  | "FUTURE_API";

export type DiscoveryPipelineStepName =
  | "validate"
  | "search_sources"
  | "extract_information"
  | "classify_data"
  | "generate_company_brain"
  | "save_memory"
  | "update_context"
  | "complete";

export type DiscoveryPipelineStepStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "skipped";

export interface DiscoveryPipelineStep {
  name: DiscoveryPipelineStepName;
  label: string;
  status: DiscoveryPipelineStepStatus;
  durationMs: number;
  result?: Record<string, unknown>;
  error?: string;
}

export interface DiscoveryInput {
  companyName: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  city?: string;
  tenantId?: string;
  companyId?: string;
  userId?: string;
}

export interface DiscoverySocialNetworks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export interface DiscoverySwotItem {
  id: string;
  title: string;
  description: string;
}

export interface DiscoveryResult {
  id: string;
  company: string;
  website: string;
  industry: string;
  services: string[];
  products: string[];
  location: string;
  socialNetworks: DiscoverySocialNetworks;
  competitors: string[];
  strengths: DiscoverySwotItem[];
  weaknesses: DiscoverySwotItem[];
  opportunities: DiscoverySwotItem[];
  risks: DiscoverySwotItem[];
  confidence: number;
  missingInformation: string[];
  executiveSummary: string;
  nextSteps: string[];
  pipeline: DiscoveryPipelineStep[];
  companyBrainId: string;
  memoriesCreated: number;
  contextFragmentCount: number;
  totalDurationMs: number;
  generatedAt: string;
}

export interface ValidatedDiscoveryInput extends DiscoveryInput {
  tenantId: string;
  companyId: string;
  userId: string;
  normalizedWebsite: string;
  normalizedCity: string;
}

export interface RawSourceData {
  source: DiscoverySourceType;
  payload: Record<string, unknown>;
  collectedAt: string;
}

export interface ExtractedDiscoveryData {
  company: string;
  website: string;
  industry: string;
  services: string[];
  products: string[];
  location: string;
  socialNetworks: DiscoverySocialNetworks;
  competitors: string[];
  sourcesUsed: DiscoverySourceType[];
}

export interface ClassifiedDiscoveryData extends ExtractedDiscoveryData {
  strengths: DiscoverySwotItem[];
  weaknesses: DiscoverySwotItem[];
  opportunities: DiscoverySwotItem[];
  risks: DiscoverySwotItem[];
  confidence: number;
  missingInformation: string[];
}

export interface DiscoverySourcePort {
  source: DiscoverySourceType;
  isAvailable(input: DiscoveryInput): boolean;
  collect(input: ValidatedDiscoveryInput): Promise<RawSourceData>;
}

export interface CompanyBrainWriterPort {
  save(snapshot: import("../orchestrator/orchestrator.types").CompanyBrainSnapshot): Promise<string>;
}

export interface DiscoveryDependencies {
  sources: DiscoverySourcePort[];
  memoryRepository: import("../memory/memory.repository").MemoryRepository;
  contextProviders?: import("../context/context.types").ContextSourceProvider[];
  companyBrainWriter?: CompanyBrainWriterPort;
}
