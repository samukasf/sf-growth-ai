import type { ExecutiveWisdom } from "../../../domain";

export type ExecutiveCEOWisdomBriefing = {
  companyId: string;
  headline: string;
  recommendations: string[];
  wisdomId: string;
};

export interface ExecutiveCEOPort {
  notifyWisdomInsight(briefing: ExecutiveCEOWisdomBriefing): Promise<void>;
  summarizeWisdomImpact(items: ExecutiveWisdom[]): Promise<string[]>;
}
