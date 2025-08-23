import { PAYMENT_METHODS } from "src/drizzle/constants";
import { VerifyPaymentParams } from "../../types";

export interface IBasePaymentProvider<
  T extends (typeof PAYMENT_METHODS)[number],
> {
  createPayment(
    userEmail: string,
    amount: number,
  ): Promise<{ referenceId: string; url: string }>;
  verifyPayment(
    payload: VerifyPaymentParams<T>,
  ): Promise<{ transactionId: string }>;
}
