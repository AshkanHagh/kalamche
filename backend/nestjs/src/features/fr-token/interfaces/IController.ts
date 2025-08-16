import { CreateCheckoutDto, VerifyPaymentDto } from "../dto";
import { ITransactionRecord, IUser } from "src/drizzle/schemas";

export interface IFrTokenController {
  createCheckout(
    user: IUser,
    params: CreateCheckoutDto,
  ): Promise<{ url: string }>;
  verifyPayment(
    userId: string,
    payload: VerifyPaymentDto,
  ): Promise<ITransactionRecord>;
}
