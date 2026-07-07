import { Service, type ServiceRepository } from "../../domain";

function serializeService(service: Service): string {
  return JSON.stringify(service.toJSON());
}

function deserializeService(raw: string): Service {
  return Service.create(JSON.parse(raw) as ReturnType<Service["toJSON"]>);
}

export class InMemoryServiceRepository implements ServiceRepository {
  private readonly services = new Map<string, string>();

  async save(service: Service): Promise<void> {
    this.services.set(service.id, serializeService(service));
  }

  async findById(id: string): Promise<Service | null> {
    const raw = this.services.get(id);
    return raw ? deserializeService(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Service[]> {
    const results: Service[] = [];
    for (const raw of this.services.values()) {
      const service = deserializeService(raw);
      if (service.organizationId === organizationId) results.push(service);
    }
    return results;
  }
}
