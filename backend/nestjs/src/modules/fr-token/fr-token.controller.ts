import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Redirect,
  Req,
  UseGuards,
} from "@nestjs/common";
import { FrTokenService } from "./fr-token.service";
import { IFrTokenPlan } from "src/drizzle/schemas";
import { RateLimitGuard } from "../rate-limit/guards/rate-limit.guard";
import { SkipPermission } from "../auth/decorators/skip-permission.decorator";
import { Request } from "express";

@Controller("fr-token")
@UseGuards(RateLimitGuard)
export class FrTokenController {
  constructor(private frTokenService: FrTokenService) {}

  @Get("/plans")
  async getPlans(): Promise<IFrTokenPlan[]> {
    return await this.frTokenService.getPlans();
  }

  @Get("redirect/:offerId")
  @SkipPermission()
  @Redirect()
  async redirectToProductPage(
    @Req() req: Request,
    @Param("offerId", new ParseUUIDPipe()) offerId: string,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.frTokenService.redirectToOfferPage(req, offerId);
    console.log(url);
    return { url, statusCode: 302 };
  }
}
