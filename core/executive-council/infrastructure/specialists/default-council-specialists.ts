import type {
  SpecialistOpinionInput,
  SpecialistOpinionResult,
  SpecialistPort,
} from "../../domain/ports/opinion-collector.port";
import type { CouncilSpecialistRole } from "../../shared";

function createSpecialist(role: CouncilSpecialistRole, label: string): SpecialistPort {
  return {
    role,
    async provideOpinion(input: SpecialistOpinionInput): Promise<SpecialistOpinionResult> {
      return {
        summary: `[${label}] Analysis of: ${input.query.slice(0, 80)}`,
        recommendation: `${label} recommends strategic action based on council deliberation`,
        priority: 60 + Math.floor(Math.random() * 25),
        confidence: 65 + Math.floor(Math.random() * 20),
        risks: [`${label} identified operational risk`],
        opportunities: [`${label} identified growth opportunity`],
      };
    },
  };
}

export const DEFAULT_COUNCIL_SPECIALISTS: SpecialistPort[] = [
  createSpecialist("finance", "Finance"),
  createSpecialist("marketing", "Marketing"),
  createSpecialist("sales", "Sales"),
  createSpecialist("operations", "Operations"),
  createSpecialist("hr", "HR"),
  createSpecialist("legal", "Legal"),
  createSpecialist("crm", "CRM"),
  createSpecialist("communication", "Communication"),
  createSpecialist("commerce", "Commerce"),
  createSpecialist("scheduling", "Scheduling"),
  createSpecialist("innovation", "Innovation"),
  createSpecialist("projects", "Projects"),
];
