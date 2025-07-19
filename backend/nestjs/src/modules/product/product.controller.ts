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
import {
  CreateProductDto,
  CreateProductSchema,
  SearchDto,
  SearchSchema,
} from "./dto";
import { SearchResponse } from "./types";
import { ZodValidationPipe } from "src/utils/zod-validation.pipe";
import { ProductService } from "./product.service";
import { IProductController } from "./interfaces/IController";
import { User } from "../auth/decorators/user.decorator";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  PRODUCT_RESOURCE_ACTION,
  ResourceType,
} from "src/constants/global.constant";
import { ITempProduct } from "src/drizzle/schemas/temp-product.schema";

@Controller("products")
@UseGuards(AuthorizationGuard, PermissionGuard)
export class ProductController implements IProductController {
  constructor(private productService: ProductService) {}

  @Post("/:shop_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async createProduct(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
    @Body(new ZodValidationPipe(CreateProductSchema)) payload: CreateProductDto,
  ): Promise<ITempProduct> {
    return this.productService.createProduct(userId, shopId, payload);
  }

  @Get("/")
  async search(
    @Query(new ZodValidationPipe(SearchSchema)) query: SearchDto,
  ): Promise<SearchResponse> {
    const result = await this.productService.search(query);
    return result;
  }
}
