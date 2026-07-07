import type { PaymentConnectorPort } from "../../application/ports/connectors";

abstract class BaseNoopPaymentConnector implements PaymentConnectorPort {
  constructor(readonly provider: PaymentConnectorPort["provider"]) {}

  isAvailable(): boolean {
    return false;
  }

  async processPayment(amount: number, currency: string) {
    return {
      success: false,
      ref: `noop-${this.provider}-${amount}-${currency}`,
    };
  }
}

export class NoopStripeConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("stripe");
  }
}

export class NoopPayPalConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("paypal");
  }
}

export class NoopMbWayConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("mbway");
  }
}

export class NoopMultibancoConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("multibanco");
  }
}

export class NoopWooCommerceConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("woocommerce");
  }
}

export class NoopShopifyConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("shopify");
  }
}

export class NoopGlovoConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("glovo");
  }
}

export class NoopUberEatsConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("uber_eats");
  }
}

export class NoopBoltFoodConnector extends BaseNoopPaymentConnector {
  constructor() {
    super("bolt_food");
  }
}

export function createDefaultPaymentConnectors(): PaymentConnectorPort[] {
  return [
    new NoopStripeConnector(),
    new NoopPayPalConnector(),
    new NoopMbWayConnector(),
    new NoopMultibancoConnector(),
    new NoopWooCommerceConnector(),
    new NoopShopifyConnector(),
    new NoopGlovoConnector(),
    new NoopUberEatsConnector(),
    new NoopBoltFoodConnector(),
  ];
}
