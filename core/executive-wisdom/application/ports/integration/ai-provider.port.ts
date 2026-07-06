import type { ExecutiveWisdom } from "../../../domain";

export type AIProviderWisdomRequest = {
  companyId: string;
  wisdom: ReturnType<ExecutiveWisdom["toJSON"]>;
};

export type AIProviderWisdomResponse = {
  available: boolean;
  reason: string;
};

export interface AIProviderPort {
  canEnhance(request: AIProviderWisdomRequest): Promise<AIProviderWisdomResponse>;
}
