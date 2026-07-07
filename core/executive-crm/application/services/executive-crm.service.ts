import type {
  CreateCustomerDto,
  CreateLeadDto,
  CreateOpportunityDto,
  MarkCustomerLostDto,
  QualifyLeadDto,
  RecoverCustomerDto,
  SendProposalDto,
  SignContractDto,
  UpdateRelationshipDto,
} from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";
import {
  CreateCustomerUseCase,
  CreateLeadUseCase,
  CreateOpportunityUseCase,
  MarkCustomerLostUseCase,
  QualifyLeadUseCase,
  RecoverCustomerUseCase,
  SendProposalUseCase,
  SignContractUseCase,
  UpdateRelationshipUseCase,
} from "../use-cases";

export class ExecutiveCrmService {
  private readonly createLeadUseCase: CreateLeadUseCase;
  private readonly qualifyLeadUseCase: QualifyLeadUseCase;
  private readonly createCustomerUseCase: CreateCustomerUseCase;
  private readonly createOpportunityUseCase: CreateOpportunityUseCase;
  private readonly sendProposalUseCase: SendProposalUseCase;
  private readonly signContractUseCase: SignContractUseCase;
  private readonly updateRelationshipUseCase: UpdateRelationshipUseCase;
  private readonly markCustomerLostUseCase: MarkCustomerLostUseCase;
  private readonly recoverCustomerUseCase: RecoverCustomerUseCase;

  constructor(private readonly deps: ExecutiveCrmDependencies) {
    this.createLeadUseCase = new CreateLeadUseCase(deps);
    this.qualifyLeadUseCase = new QualifyLeadUseCase(deps);
    this.createCustomerUseCase = new CreateCustomerUseCase(deps);
    this.createOpportunityUseCase = new CreateOpportunityUseCase(deps);
    this.sendProposalUseCase = new SendProposalUseCase(deps);
    this.signContractUseCase = new SignContractUseCase(deps);
    this.updateRelationshipUseCase = new UpdateRelationshipUseCase(deps);
    this.markCustomerLostUseCase = new MarkCustomerLostUseCase(deps);
    this.recoverCustomerUseCase = new RecoverCustomerUseCase(deps);
  }

  createLead(dto: CreateLeadDto) {
    return this.createLeadUseCase.execute(dto);
  }

  qualifyLead(dto: QualifyLeadDto) {
    return this.qualifyLeadUseCase.execute(dto);
  }

  createCustomer(dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute(dto);
  }

  createOpportunity(dto: CreateOpportunityDto) {
    return this.createOpportunityUseCase.execute(dto);
  }

  sendProposal(dto: SendProposalDto) {
    return this.sendProposalUseCase.execute(dto);
  }

  signContract(dto: SignContractDto) {
    return this.signContractUseCase.execute(dto);
  }

  updateRelationship(dto: UpdateRelationshipDto) {
    return this.updateRelationshipUseCase.execute(dto);
  }

  markCustomerLost(dto: MarkCustomerLostDto) {
    return this.markCustomerLostUseCase.execute(dto);
  }

  recoverCustomer(dto: RecoverCustomerDto) {
    return this.recoverCustomerUseCase.execute(dto);
  }

  async listLeads(organizationId: string) {
    return this.deps.leadRepository.findByOrganization(organizationId);
  }

  async listCustomers(organizationId: string) {
    return this.deps.customerRepository.findByOrganization(organizationId);
  }

  async listOpportunities(organizationId: string) {
    return this.deps.opportunityRepository.findByOrganization(organizationId);
  }

  async listPipelines(organizationId: string) {
    return this.deps.pipelineRepository.findByOrganization(organizationId);
  }
}
