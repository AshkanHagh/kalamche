export interface BasePaymentProvider {
  createPayment(
    userEmail: string,
    amount: number,
  ): Promise<{ referenceId: string; url: string }>;
  verifyPayment(payload: unknown): Promise<string>;
}
