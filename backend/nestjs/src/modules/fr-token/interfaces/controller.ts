import { IFrTokenPlan } from "src/drizzle/schemas";

export interface IFrTokenController {
  getPlans(): Promise<IFrTokenPlan[]>;
}
