export type PaymentConnectorProvider =
  | "stripe"
  | "paypal"
  | "mbway"
  | "multibanco"
  | "woocommerce"
  | "shopify"
  | "glovo"
  | "uber_eats"
  | "bolt_food";

export interface PaymentConnectorPort {
  provider: PaymentConnectorProvider;
  isAvailable(): boolean;
  processPayment(amount: number, currency: string): Promise<{ success: boolean; ref: string }>;
}
