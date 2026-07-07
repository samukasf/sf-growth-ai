import { Order, OrderItem, type Cart, type CommerceEngine, type OrderChannel } from "../../domain";

export class DefaultCommerceEngine implements CommerceEngine {
  buildOrderFromCart(
    cart: Cart,
    taxRate: number,
    options: { customerId: string; channel: OrderChannel },
  ) {
    const subtotal = cart.subtotal();
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const order = Order.create({
      organizationId: cart.organizationId,
      customerId: options.customerId,
      status: "pending",
      channel: options.channel,
      subtotal,
      tax,
      total,
      currency: cart.currency,
      itemIds: [],
    });

    const items = cart.items.map((item) =>
      OrderItem.create({
        organizationId: cart.organizationId,
        orderId: order.id,
        itemType: item.itemType,
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: cart.currency,
      }),
    );

    const orderWithItems = Order.create({
      ...order.toJSON(),
      itemIds: items.map((i) => i.id),
    });

    return { order: orderWithItems, items };
  }

  summarize(order: Order, items: OrderItem[]) {
    return {
      orderId: order.id,
      itemCount: items.length,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      currency: order.currency,
    };
  }
}
