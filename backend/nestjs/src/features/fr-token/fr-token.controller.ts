import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { FrTokenService } from "./fr-token.service";
import { IFrTokenController } from "./interfaces/IController";
import { CreateCheckoutDto, VerifyPaymentDto } from "./dto";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { User } from "../auth/decorators/user.decorator";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  PRODUCT_RESOURCE_ACTION,
  ResourceType,
} from "src/constants/global.constant";
import { IUser } from "src/drizzle/types";
import { RateLimitGuard } from "../rate-limit/guards/rate-limit.guard";
import { ITransactionRecord } from "src/drizzle/schemas";
import { ApiParams } from "src/utils/swagger-decorator";

@Controller("fr-token")
@UseGuards(AuthorizationGuard, PermissionGuard, RateLimitGuard)
export class FrTokenController implements IFrTokenController {
  constructor(private frTokenService: FrTokenService) {}

  @ApiParams({ type: CreateCheckoutDto })
  @Get("/:paymentMethod/:planId")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async createCheckout(
    @User() user: IUser,
    @Param() params: CreateCheckoutDto,
  ): Promise<{ url: string }> {
    const url = await this.frTokenService.createCheckout(user, params);
    return { url };
  }

  @Post("/verify")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async verifyPayment(
    @User("id") userId: string,
    @Body() payload: VerifyPaymentDto,
  ): Promise<ITransactionRecord> {
    return await this.frTokenService.verifyPayment(userId, payload);
  }
}
