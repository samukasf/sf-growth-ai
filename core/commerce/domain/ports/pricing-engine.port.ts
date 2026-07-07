import type { Offer, Product, Service } from "../entities";
import type { PricingScore } from "../../shared";

export type PriceBreakdown = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
};

export interface PricingEngine {
  calculateProductPrice(product: Product, quantity: number, offer?: Offer): PriceBreakdown;
  calculateServicePrice(service: Service, offer?: Offer): PriceBreakdown;
  score(price: number, marketAverage: number): PricingScore;
}
