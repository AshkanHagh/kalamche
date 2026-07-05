import { Controller, Get, UseGuards } from "@nestjs/common";
import { FrTokenService } from "./fr-token.service";
import { IFrTokenController } from "./interfaces/controller";
import { IFrTokenPlan } from "src/drizzle/schemas";
import { RateLimitGuard } from "../rate-limit/guards/rate-limit.guard";

@Controller("fr-token")
@UseGuards(RateLimitGuard)
export class FrTokenController implements IFrTokenController {
  constructor(private frTokenService: FrTokenService) {}

  @Get("/plans")
  async getPlans(): Promise<IFrTokenPlan[]> {
    return await this.frTokenService.getPlans();
  }
}
