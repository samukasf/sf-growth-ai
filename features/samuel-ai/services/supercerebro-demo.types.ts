export type SupercerebroDemoPhase =
  | "idle"
  | "analyzing_brain"
  | "convening_council"
  | "consulting_specialists"
  | "forming_consensus"
  | "recommending_plan"
  | "complete";

export type SupercerebroSpecialistView = {
  role: string;
  name: string;
  summary: string;
  recommendation: string;
  priority: number;
  confidence: number;
  risks: string[];
  opportunities: string[];
};

export type SupercerebroDemoResult = {
  greeting: string;
  companyState: string;
  opportunities: string[];
  risks: string[];
  councilConvened: string;
  specialists: SupercerebroSpecialistView[];
  consensus: string;
  recommendedProject: string;
  estimatedRoi: string;
  nextAction: string;
  ceoResponse: string;
  brainConfidence: number;
};

export type RunSupercerebroDemoInput = {
  organizationId: string;
  companyId: string;
  companyName: string;
  greeting?: string;
  query?: string;
  onPhase?: (phase: SupercerebroDemoPhase) => void;
};
