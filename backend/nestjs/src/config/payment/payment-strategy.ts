export interface PaymentStrategy {
  processPayment(email: string, amount: number, name: string): Promise<string>;
  validatePaymentDetails(): void;
}
