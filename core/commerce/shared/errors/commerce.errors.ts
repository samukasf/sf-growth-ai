export class CommerceDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommerceDomainError";
  }
}

export class ProductNotFoundError extends CommerceDomainError {
  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = "ProductNotFoundError";
  }
}

export class OrderNotFoundError extends CommerceDomainError {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.name = "OrderNotFoundError";
  }
}

export class PaymentNotFoundError extends CommerceDomainError {
  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`);
    this.name = "PaymentNotFoundError";
  }
}

export class CommerceValidationError extends CommerceDomainError {
  constructor(message: string) {
    super(message);
    this.name = "CommerceValidationError";
  }
}
