import { LeadNotFoundError } from "../../shared";
import { createLeadQualifiedEvent } from "../../domain";
import type { QualifyLeadDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class QualifyLeadUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: QualifyLeadDto) {
    const lead = await this.deps.leadRepository.findById(dto.leadId);
    if (!lead) throw new LeadNotFoundError(dto.leadId);

    const leadScore = this.deps.leadScoringEngine.score(lead);
    const qualified = lead.qualify(leadScore.value);
    await this.deps.leadRepository.save(qualified);
    await this.deps.eventDispatcher.publish(createLeadQualifiedEvent(qualified, leadScore.value));

    return { lead: qualified, leadScore };
  }
}
