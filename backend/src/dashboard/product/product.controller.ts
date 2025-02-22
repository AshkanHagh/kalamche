import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UpdateProductDto, updateProductDto } from "./dto/update-product";
import { productSearchDto, ProductSearchDto } from "./dto/search-product";

@Controller("product")
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get("/search")
  public async searchProducts(
    @Query(new ZodValidationPipe(productSearchDto)) query: ProductSearchDto,
  ) {
    const products = await this.service.searchProducts(
      query.limit,
      query.offset,
      query.name,
    );

    return { products };
  }

  @Post("/")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthorizationGuard)
  public async createProduct(
    @Req() req: CustomeRequest,
    @Body(new ZodValidationPipe(createProductDto)) payload: CreateProductDto,
  ) {
    const store = await this.service.createProduct(req.userId!, payload);
    return { store };
  }

  @Get("/:productId")
  public async getProduct(
    @Param("productId", new ParseUUIDPipe()) productId: string,
  ) {
    const { product, similerProductStores } =
      await this.service.getProduct(productId);

    return { product, similerProductStores };
  }

  @Patch("/:storeId/:productId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthorizationGuard)
  public async updateProduct(
    @Req() req: CustomeRequest,
    @Param() params: { storeId: string; productId: string },
    @Body(new ZodValidationPipe(updateProductDto)) payload: UpdateProductDto,
  ) {
    if (payload.images) {
      await this.service.checkOldImagesHasDeleted(
        params.productId,
        payload.images,
      );
    }

    const store = await this.service.updateProduct(
      params.productId,
      params.storeId,
      req.userId!,
      payload,
    );

    return { store };
  }

  @Delete("/:storeId/:productId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthorizationGuard)
  public async deleteProduct(
    @Req() req: CustomeRequest,
    @Param() params: { storeId: string; productId: string },
  ) {
    await this.service.deleteProduct(
      req.userId!,
      params.productId,
      params.storeId,
    );
  }
}
