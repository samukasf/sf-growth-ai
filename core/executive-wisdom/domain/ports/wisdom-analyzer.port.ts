import type { ExecutiveWisdom } from "../entities";
import type { Score } from "../../shared";

export type WisdomAnalysisReport = {
  wisdomId: string;
  summary: string;
  strengths: string[];
  risks: string[];
  decisionReadiness: Score;
  suggestedActions: string[];
};

export interface WisdomAnalyzer {
  analyze(wisdom: ExecutiveWisdom): WisdomAnalysisReport;
  analyzeBatch(items: ExecutiveWisdom[]): WisdomAnalysisReport[];
}
