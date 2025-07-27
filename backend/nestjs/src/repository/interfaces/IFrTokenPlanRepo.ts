import { IFrTokenPlan } from "src/drizzle/schemas";

export interface IFrTokenPlanRepo {
  findById(id: string): Promise<IFrTokenPlan>;
}
