import { Customer, type CustomerRepository } from "../../domain";

function serializeCustomer(customer: Customer): string {
  return JSON.stringify(customer.toJSON());
}

function deserializeCustomer(raw: string): Customer {
  return Customer.create(JSON.parse(raw) as ReturnType<Customer["toJSON"]>);
}

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers = new Map<string, string>();

  async save(customer: Customer): Promise<void> {
    this.customers.set(customer.id, serializeCustomer(customer));
  }

  async findById(id: string): Promise<Customer | null> {
    const raw = this.customers.get(id);
    return raw ? deserializeCustomer(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Customer[]> {
    const results: Customer[] = [];
    for (const raw of this.customers.values()) {
      const customer = deserializeCustomer(raw);
      if (customer.organizationId === organizationId) results.push(customer);
    }
    return results;
  }
}
