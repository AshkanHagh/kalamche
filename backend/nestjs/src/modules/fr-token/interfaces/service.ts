import { IFrTokenPlan } from "src/drizzle/schemas";

export interface IFrTokenService {
  getPlans(): Promise<IFrTokenPlan[]>;
}
