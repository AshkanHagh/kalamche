import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  PRODUCT_RESOURCE_ACTION,
  ResourceType,
} from "src/constants/global.constant";
import { IUser } from "src/drizzle/schemas";
import { User } from "../auth/decorators/user.decorator";
import { CreateCheckoutDto, VerifyPaymentDto } from "./dtos";
import { IPaymentController } from "./interfaces/controller";
import { RateLimitGuard } from "../rate-limit/guards/rate-limit.guard";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";

@Controller("payments")
@UseGuards(AuthorizationGuard, PermissionGuard, RateLimitGuard)
export class PaymentController implements IPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(":provider/:planId")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async createCheckout(
    @User() user: IUser,
    @Param() params: CreateCheckoutDto,
  ) {
    return await this.paymentService.createCheckout(user, params);
  }

  @Post("verify")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async verifyPayment(
    @User("id") userId: string,
    @Body() payload: VerifyPaymentDto,
  ) {
    return await this.paymentService.verifyPayment(userId, payload);
  }
}
