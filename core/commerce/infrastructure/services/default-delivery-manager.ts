import { Delivery, type DeliveryManager, type Order } from "../../domain";

export class DefaultDeliveryManager implements DeliveryManager {
  create(order: Order, address: string, provider: Delivery["provider"]) {
    const delivery = Delivery.create({
      organizationId: order.organizationId,
      orderId: order.id,
      provider,
      address,
      trackingCode: `TRK-${Date.now()}`,
      estimatedAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

    return {
      delivery,
      estimatedAt: delivery.estimatedAt ?? new Date().toISOString(),
      trackingCode: delivery.trackingCode ?? "",
    };
  }

  track(delivery: Delivery) {
    return {
      status: delivery.status,
      message: `Rastreamento simulado para ${delivery.trackingCode ?? delivery.id}`,
    };
  }
}
