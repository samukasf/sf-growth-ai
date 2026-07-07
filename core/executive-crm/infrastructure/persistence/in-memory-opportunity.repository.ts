import { Opportunity, type OpportunityRepository } from "../../domain";

function serializeOpportunity(opportunity: Opportunity): string {
  return JSON.stringify(opportunity.toJSON());
}

function deserializeOpportunity(raw: string): Opportunity {
  return Opportunity.create(JSON.parse(raw) as ReturnType<Opportunity["toJSON"]>);
}

export class InMemoryOpportunityRepository implements OpportunityRepository {
  private readonly opportunities = new Map<string, string>();

  async save(opportunity: Opportunity): Promise<void> {
    this.opportunities.set(opportunity.id, serializeOpportunity(opportunity));
  }

  async findById(id: string): Promise<Opportunity | null> {
    const raw = this.opportunities.get(id);
    return raw ? deserializeOpportunity(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Opportunity[]> {
    const results: Opportunity[] = [];
    for (const raw of this.opportunities.values()) {
      const opportunity = deserializeOpportunity(raw);
      if (opportunity.organizationId === organizationId) results.push(opportunity);
    }
    return results;
  }

  async findByCustomer(customerId: string): Promise<Opportunity[]> {
    const results: Opportunity[] = [];
    for (const raw of this.opportunities.values()) {
      const opportunity = deserializeOpportunity(raw);
      if (opportunity.customerId === customerId) results.push(opportunity);
    }
    return results;
  }
}
