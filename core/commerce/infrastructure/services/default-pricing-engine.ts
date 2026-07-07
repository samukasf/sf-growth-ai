import type { Offer, PricingEngine, Product, Service } from "../../domain";

export class DefaultPricingEngine implements PricingEngine {
  calculateProductPrice(product: Product, quantity: number, offer?: Offer) {
    const base = product.price * quantity;
    const discount = offer ? Math.max(0, base - offer.discountedPrice * quantity) : 0;
    const subtotal = base - discount;
    const tax = Math.round(subtotal * 0.23 * 100) / 100;
    return {
      subtotal,
      discount,
      tax,
      total: subtotal + tax,
      currency: product.currency,
    };
  }

  calculateServicePrice(service: Service, offer?: Offer) {
    const base = service.price;
    const discount = offer ? Math.max(0, base - offer.discountedPrice) : 0;
    const subtotal = base - discount;
    const tax = Math.round(subtotal * 0.23 * 100) / 100;
    return {
      subtotal,
      discount,
      tax,
      total: subtotal + tax,
      currency: service.currency,
    };
  }

  score(price: number, marketAverage: number) {
    const ratio = marketAverage > 0 ? price / marketAverage : 1;
    const value = Math.max(0, Math.min(100, Math.round((2 - ratio) * 50)));
    const competitiveness: "low" | "medium" | "high" =
      value >= 70 ? "high" : value >= 40 ? "medium" : "low";
    return { value, competitiveness };
  }
}
