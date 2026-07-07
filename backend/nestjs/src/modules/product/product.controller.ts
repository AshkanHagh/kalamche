import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateOfferDto, CreateProductDto, SearchDto } from "./dto";
import { ProductService } from "./product.service";
import { User } from "../auth/decorators/user.decorator";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  PRODUCT_RESOURCE_ACTION,
  ResourceType,
} from "src/constants/global.constant";
import { SkipAuth } from "../auth/decorators/skip-auth.decorator";
import { SkipPermission } from "../auth/decorators/skip-permission.decorator";

@Controller("products")
@UseGuards(AuthorizationGuard, PermissionGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post("")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async createProduct(
    @User("id") userId: string,
    @Body() payload: CreateProductDto,
  ) {
    return this.productService.createProduct(userId, payload);
  }

  @Post("/offers/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  createOffer(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Body() payload: CreateOfferDto,
  ) {
    return this.productService.createOffer(userId, productId, payload);
  }

  @Get("/")
  @SkipAuth()
  @SkipPermission()
  async search(@Query() params: SearchDto) {
    return await this.productService.search(params);
  }
}
