export class BusinessOperatingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessOperatingError";
  }
}

export class BusinessDayNotFoundError extends BusinessOperatingError {
  constructor(businessDayId: string) {
    super(`Business day not found: ${businessDayId}`);
    this.name = "BusinessDayNotFoundError";
  }
}
