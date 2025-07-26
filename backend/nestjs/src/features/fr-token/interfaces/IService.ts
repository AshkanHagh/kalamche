import { IUser } from "src/drizzle/types";
import { CreateCheckoutDto } from "../dto";

export interface IFrTokenService {
  createCheckout(user: IUser, payload: CreateCheckoutDto): Promise<string>;
}
