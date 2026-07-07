import type { Delivery, Order } from "../entities";

export type DeliveryPlan = {
  delivery: Delivery;
  estimatedAt: string;
  trackingCode: string;
};

export interface DeliveryManager {
  create(order: Order, address: string, provider: Delivery["provider"]): DeliveryPlan;
  track(delivery: Delivery): { status: string; message: string };
}
