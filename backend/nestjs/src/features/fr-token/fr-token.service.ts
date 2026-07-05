import { Inject, Injectable } from "@nestjs/common";
import { IFrTokenService } from "./interfaces/service";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";

@Injectable()
export class FrTokenService implements IFrTokenService {
  constructor(@Inject(DATABASE) private db: Database) {}

  async getPlans() {
    return await this.db.query.FrTokenPlanTable.findMany();
  }
}
