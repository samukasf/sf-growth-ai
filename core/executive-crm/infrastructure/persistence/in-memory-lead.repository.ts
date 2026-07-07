import { Lead, type LeadRepository } from "../../domain";

function serializeLead(lead: Lead): string {
  return JSON.stringify(lead.toJSON());
}

function deserializeLead(raw: string): Lead {
  return Lead.create(JSON.parse(raw) as ReturnType<Lead["toJSON"]>);
}

export class InMemoryLeadRepository implements LeadRepository {
  private readonly leads = new Map<string, string>();

  async save(lead: Lead): Promise<void> {
    this.leads.set(lead.id, serializeLead(lead));
  }

  async findById(id: string): Promise<Lead | null> {
    const raw = this.leads.get(id);
    return raw ? deserializeLead(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Lead[]> {
    const results: Lead[] = [];
    for (const raw of this.leads.values()) {
      const lead = deserializeLead(raw);
      if (lead.organizationId === organizationId) results.push(lead);
    }
    return results;
  }
}
