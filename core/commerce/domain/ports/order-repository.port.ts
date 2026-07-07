import type { OrderId, OrganizationId } from "../../shared";
import type { Cart, Checkout, Order, OrderItem } from "../entities";

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Order[]>;
  saveItem(item: OrderItem): Promise<void>;
  findItemsByOrder(orderId: OrderId): Promise<OrderItem[]>;
  saveCart(cart: Cart): Promise<void>;
  findCartById(id: string): Promise<Cart | null>;
  saveCheckout(checkout: Checkout): Promise<void>;
}
