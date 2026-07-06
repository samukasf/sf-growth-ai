import { InnovationOpportunityNotFoundError } from "../../shared";
import {
  InnovationProject,
  createInnovationApprovedEvent,
  createInnovationProjectCreatedEvent,
  createInnovationRejectedEvent,
} from "../../domain";
import type {
  ApproveInnovationDto,
  CreateInnovationProjectDto,
  RejectInnovationDto,
} from "../dto";
import type { ExecutiveInnovationEngineDependencies } from "../dependencies";

export class ApproveInnovationUseCase {
  constructor(private readonly deps: ExecutiveInnovationEngineDependencies) {}

  async execute(dto: ApproveInnovationDto) {
    const opportunity = await this.deps.repository.findOpportunityById(dto.opportunityId);
    if (!opportunity) {
      throw new InnovationOpportunityNotFoundError(dto.opportunityId);
    }

    const approved = opportunity.approve();
    await this.deps.repository.saveOpportunity(approved);
    await this.deps.eventDispatcher.publish(createInnovationApprovedEvent(approved));

    return approved;
  }
}

export class RejectInnovationUseCase {
  constructor(private readonly deps: ExecutiveInnovationEngineDependencies) {}

  async execute(dto: RejectInnovationDto) {
    const opportunity = await this.deps.repository.findOpportunityById(dto.opportunityId);
    if (!opportunity) {
      throw new InnovationOpportunityNotFoundError(dto.opportunityId);
    }

    const rejected = opportunity.reject();
    await this.deps.repository.saveOpportunity(rejected);
    await this.deps.eventDispatcher.publish(createInnovationRejectedEvent(rejected));

    return rejected;
  }
}

export class CreateInnovationProjectUseCase {
  constructor(private readonly deps: ExecutiveInnovationEngineDependencies) {}

  async execute(dto: CreateInnovationProjectDto) {
    const opportunity = await this.deps.repository.findOpportunityById(dto.opportunityId);
    if (!opportunity) {
      throw new InnovationOpportunityNotFoundError(dto.opportunityId);
    }

    const project = InnovationProject.create({
      companyId: dto.companyId,
      opportunityId: dto.opportunityId,
      title: opportunity.title,
      description: opportunity.description,
      priority: opportunity.expectedImpact,
    });

    await this.deps.repository.saveProject(project);
    await this.deps.eventDispatcher.publish(createInnovationProjectCreatedEvent(project));

    return project;
  }
}
