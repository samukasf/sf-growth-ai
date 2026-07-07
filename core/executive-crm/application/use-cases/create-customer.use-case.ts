import {
  CustomerJourney,
  RelationshipProfile,
  createCustomerCreatedEvent,
} from "../../domain";
import { Customer } from "../../domain";
import type { CreateCustomerDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class CreateCustomerUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: CreateCustomerDto) {
    const customer = Customer.create({
      organizationId: dto.organizationId,
      leadId: dto.leadId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      company: dto.company,
      segment: dto.segment,
      ownerId: dto.ownerId,
    });

    await this.deps.customerRepository.save(customer);

    const profile = RelationshipProfile.create({
      organizationId: dto.organizationId,
      entityId: customer.id,
      entityType: "customer",
      communicationPreferences: [
        { channel: "email", preferred: true, frequency: "medium" },
      ],
      purchaseHistory: [],
      interactionHistory: [],
      satisfactionScore: 70,
      relationshipScore: 60,
      riskScore: 20,
      lifetimeValue: 0,
      recommendedActions: this.deps.recommendationEngine.recommend(
        RelationshipProfile.create({
          organizationId: dto.organizationId,
          entityId: customer.id,
          entityType: "customer",
          communicationPreferences: [],
          purchaseHistory: [],
          interactionHistory: [],
          satisfactionScore: 70,
          relationshipScore: 60,
          riskScore: 20,
          lifetimeValue: 0,
          recommendedActions: [],
        }),
      ),
    });

    await this.deps.crmRepository.saveRelationshipProfile(profile);

    const journey = CustomerJourney.create({
      organizationId: dto.organizationId,
      customerId: customer.id,
      currentStage: "onboarding",
      milestones: [
        { id: "m1", stage: "onboarding", title: "Welcome", status: "pending" },
      ],
      healthScore: customer.healthScore,
      nextBestAction: this.deps.journeyAnalyzer.analyze(
        CustomerJourney.create({
          organizationId: dto.organizationId,
          customerId: customer.id,
          currentStage: "onboarding",
          milestones: [],
          healthScore: customer.healthScore,
        }),
      ).nextBestAction,
    });

    await this.deps.crmRepository.saveCustomerJourney(journey);
    await this.deps.eventDispatcher.publish(createCustomerCreatedEvent(customer));

    return { customer, profile, journey };
  }
}
