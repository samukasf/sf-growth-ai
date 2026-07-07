import type { Cart, Order, OrderItem, OrderChannel } from "../entities";

export type CommerceSummary = {
  orderId: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
};

export interface CommerceEngine {
  buildOrderFromCart(
    cart: Cart,
    taxRate: number,
    options: { customerId: string; channel: OrderChannel },
  ): { order: Order; items: OrderItem[] };
  summarize(order: Order, items: OrderItem[]): CommerceSummary;
}
