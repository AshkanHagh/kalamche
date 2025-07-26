import { IUser } from "src/drizzle/types";
import { CreateCheckoutDto } from "../dto";

export interface IFrTokenController {
  createCheckout(
    user: IUser,
    payload: CreateCheckoutDto,
  ): Promise<{ url: string }>;
}
