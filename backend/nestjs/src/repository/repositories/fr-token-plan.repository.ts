import { Inject, Injectable } from "@nestjs/common";
import { IFrTokenPlanRepo } from "../interfaces/IFrTokenPlanRepo";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { FrTokenPlanTable, IFrTokenPlan } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

@Injectable()
export class FrTokenPlanRepository implements IFrTokenPlanRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async findById(id: string): Promise<IFrTokenPlan> {
    const [plan] = await this.db
      .select()
      .from(FrTokenPlanTable)
      .where(eq(FrTokenPlanTable.id, id));
    if (!plan) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return plan;
  }

  async findAll(): Promise<IFrTokenPlan[]> {
    return await this.db.select().from(FrTokenPlanTable);
  }
}
