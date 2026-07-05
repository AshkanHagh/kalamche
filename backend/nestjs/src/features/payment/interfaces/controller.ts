import { ITransactionRecord, IUser } from "src/drizzle/schemas";
import { CreateCheckoutDto, VerifyPaymentDto } from "../dtos";

export interface IPaymentController {
  createCheckout(
    user: IUser,
    params: CreateCheckoutDto,
  ): Promise<{ url: string }>;
  verifyPayment(
    userId: string,
    payload: VerifyPaymentDto,
  ): Promise<ITransactionRecord>;
}
