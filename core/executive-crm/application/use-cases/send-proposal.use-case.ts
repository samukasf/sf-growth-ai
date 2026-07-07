import { createProposalSentEvent } from "../../domain";
import type { SendProposalDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class SendProposalUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: SendProposalDto) {
    const proposal = await this.deps.crmRepository.findProposalById(dto.proposalId);
    if (!proposal) throw new Error(`Proposal not found: ${dto.proposalId}`);

    const sent = proposal.markSent();
    await this.deps.crmRepository.saveProposal(sent);
    await this.deps.eventDispatcher.publish(createProposalSentEvent(sent));

    return sent;
  }
}
