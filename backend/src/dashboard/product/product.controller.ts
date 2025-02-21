import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthorizationGuard } from "../guards/authorization";
import { ZodValidationPipe } from "src/common/utils/zod-validation.pipe";
import { CreateProductDto, createProductDto } from "./dto/create-product";
import { ProductService } from "./product.service";
import { CustomeRequest } from "../types/req";

@Controller("product")
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post("/")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthorizationGuard)
  public async createProduct(
    @Req() req: CustomeRequest,
    @Body(new ZodValidationPipe(createProductDto)) payload: CreateProductDto,
  ) {
    const store = await this.service.createProduct(req.userId!, payload);
    return {
      success: true,
      store,
    };
  }

  @Get("/:productId")
  public async getProduct(
    @Param("productId", new ParseUUIDPipe()) productId: string,
  ) {
    const { product, similerProductStores } =
      await this.service.getProduct(productId);
    return {
      success: true,
      product,
      similerProductStores,
    };
  }

  @Get("/search/filters")
  public getProductFilters(@Query("q") query: string) {
    const filters = this.service.getSearchFilters(query);
    return {
      success: true,
      filters,
    };
  }
}
