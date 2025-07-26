import { PAYMENT_METHODS } from "../../constants";
import { VerifyPaymentParams, VerifyPaymentResponse } from "../../types";

export interface IBasePaymentProvider<
  T extends (typeof PAYMENT_METHODS)[number],
> {
  createPayment(
    userEmail: string,
    amount: number,
  ): Promise<{ transactionId: string; url: string }>;
  verifyPayment(
    payload: VerifyPaymentParams<T>,
  ): Promise<VerifyPaymentResponse<T>>;
}
