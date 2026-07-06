import type { ExecutiveProject, ProjectType } from "../entities";

export type ProjectGenerationInput = {
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

export interface ProjectGenerator {
  generate(input: ProjectGenerationInput): ExecutiveProject;
}
