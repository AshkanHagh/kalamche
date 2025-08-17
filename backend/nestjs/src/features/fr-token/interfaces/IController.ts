import { CreateCheckoutDto, VerifyPaymentDto } from "../dto";
import { IFrTokenPlan, ITransactionRecord, IUser } from "src/drizzle/schemas";

export interface IFrTokenController {
  createCheckout(
    user: IUser,
    params: CreateCheckoutDto,
  ): Promise<{ url: string }>;
  verifyPayment(
    userId: string,
    payload: VerifyPaymentDto,
  ): Promise<ITransactionRecord>;
  getPlans(): Promise<IFrTokenPlan[]>;
}
