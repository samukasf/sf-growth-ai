import {
  Cart,
  Checkout,
  Order,
  OrderItem,
  type OrderRepository,
} from "../../domain";

function serializeOrder(order: Order): string {
  return JSON.stringify(order.toJSON());
}

function deserializeOrder(raw: string): Order {
  return Order.create(JSON.parse(raw) as ReturnType<Order["toJSON"]>);
}

function serializeCart(cart: Cart): string {
  return JSON.stringify(cart.toJSON());
}

function deserializeCart(raw: string): Cart {
  return Cart.create(JSON.parse(raw) as ReturnType<Cart["toJSON"]>);
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, string>();
  private readonly items: OrderItem[] = [];
  private readonly carts = new Map<string, string>();
  private readonly checkouts: Checkout[] = [];

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, serializeOrder(order));
  }

  async findById(id: string): Promise<Order | null> {
    const raw = this.orders.get(id);
    return raw ? deserializeOrder(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Order[]> {
    const results: Order[] = [];
    for (const raw of this.orders.values()) {
      const order = deserializeOrder(raw);
      if (order.organizationId === organizationId) results.push(order);
    }
    return results;
  }

  async saveItem(item: OrderItem): Promise<void> {
    this.items.push(item);
  }

  async findItemsByOrder(orderId: string): Promise<OrderItem[]> {
    return this.items.filter((i) => i.orderId === orderId);
  }

  async saveCart(cart: Cart): Promise<void> {
    this.carts.set(cart.id, serializeCart(cart));
  }

  async findCartById(id: string): Promise<Cart | null> {
    const raw = this.carts.get(id);
    return raw ? deserializeCart(raw) : null;
  }

  async saveCheckout(checkout: Checkout): Promise<void> {
    this.checkouts.push(checkout);
  }
}
