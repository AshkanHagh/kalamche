import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { FrTokenService } from "./fr-token.service";
import { IFrTokenController } from "./interfaces/IController";
import { CreateCheckoutDto, CreateCheckoutSchema } from "./dto";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { ZodValidationPipe } from "src/utils/zod-validation.pipe";
import { User } from "../auth/decorators/user.decorator";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  PRODUCT_RESOURCE_ACTION,
  ResourceType,
} from "src/constants/global.constant";
import { IUser } from "src/drizzle/types";
import { RateLimitGuard } from "../rate-limit/guards/rate-limit.guard";

@Controller("fr-token")
@UseGuards(AuthorizationGuard, PermissionGuard, RateLimitGuard)
export class FrTokenController implements IFrTokenController {
  constructor(private frTokenService: FrTokenService) {}

  @Get("/:paymentMethod/:planId")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async createCheckout(
    @User() user: IUser,
    @Param(new ZodValidationPipe(CreateCheckoutSchema))
    payload: CreateCheckoutDto,
  ): Promise<{ url: string }> {
    const url = await this.frTokenService.createCheckout(user, payload);
    return { url };
  }
}
