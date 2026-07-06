import type { ProjectType } from "../../domain";

export type GenerateProjectDto = {
  companyId: string;
  projectType?: ProjectType;
  businessProblem: string;
  proposedSolution?: string;
  title?: string;
  description?: string;
  expectedImpact?: number;
  estimatedROI?: number;
  estimatedCost?: number;
  estimatedDuration?: number;
  relatedInnovation?: string[];
  relatedKnowledge?: string[];
  relatedLearning?: string[];
  relatedWisdom?: string[];
  tags?: string[];
};

export type ApproveProjectDto = { projectId: string };
export type RejectProjectDto = { projectId: string };
export type StartProjectDto = { projectId: string };
export type CompleteProjectDto = { projectId: string };
