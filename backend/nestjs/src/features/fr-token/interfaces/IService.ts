import { CreateCheckoutDto, VerifyPaymentPayload } from "../dto";
import { ITransactionRecord, IUser } from "src/drizzle/schemas";

export interface IFrTokenService {
  createCheckout(user: IUser, params: CreateCheckoutDto): Promise<string>;
  verifyPayment(
    userId: string,
    payload: VerifyPaymentPayload,
  ): Promise<ITransactionRecord>;
}
