import { ProjectROI } from "../../domain";
import type { ROIEngine, ROIEngineInput } from "../../domain";

export class DefaultROIEngine implements ROIEngine {
  compute(input: ROIEngineInput): ProjectROI {
    const { project, opportunity } = input;
    const baseInvestment = Math.max(10000, project.estimatedInvestment || 25000);
    const baseRoi = opportunity?.estimatedROI ?? project.estimatedROI ?? 100000;
    const paybackMonths = baseInvestment > 0 ? Math.ceil((baseInvestment / Math.max(baseRoi, 1)) * 12) : 0;
    const confidence = opportunity?.confidence ?? 70;

    return ProjectROI.create({
      projectId: project.id,
      estimatedInvestment: baseInvestment,
      estimatedROI: baseRoi,
      paybackMonths,
      confidence,
    });
  }
}

