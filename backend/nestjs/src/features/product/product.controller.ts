import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  CompleteProductCreationDto,
  CompleteProductCreationSchema,
  CreateOfferDto,
  CreateOfferSchema,
  CreateProductDto,
  CreateProductSchema,
} from "./dto";
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
import { IProduct, IProductOffer, IProductView } from "src/drizzle/types";
import { FileFieldsInterceptor } from "@nestjs/platform-express";

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

  @Patch("/complete/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async completeProductCreation(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Body(new ZodValidationPipe(CompleteProductCreationSchema))
    payload: CompleteProductCreationDto,
  ): Promise<IProduct> {
    return this.productService.completeProductCreation(
      userId,
      productId,
      payload,
    );
  }

  @Get("/upc/:upc")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async getProductByUpc(@Param("upc") upc: string): Promise<IProductView> {
    return this.productService.getProductByUpc(upc);
  }

  @Post("/offer/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  createOffer(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Body(new ZodValidationPipe(CreateOfferSchema))
    payload: CreateOfferDto,
  ): Promise<IProductOffer> {
    return this.productService.createOffer(userId, productId, payload);
  }

  @Post("/images/:product_id")
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: "thumbnailImage",
        maxCount: 1,
      },
      {
        name: "images",
        maxCount: 5,
      },
    ]),
  )
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.UPDATE)
  async uploadImages(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Query("is-temp", new ParseBoolPipe()) isTemp: boolean,
    // thumbnailImage might not exists
    // and nestjs sent undefined not empty [] if not image uploaded
    @UploadedFiles()
    files: {
      thumbnailImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ): Promise<void> {
    await this.productService.uploadImages(userId, productId, isTemp, {
      thumbnailImage: files.thumbnailImage
        ? files.thumbnailImage[0]
        : undefined,
      images: files.images || [],
    });
  }

  // @Get("/")
  // @SkipAuth()
  // @SkipPermission()
  // async search(
  //   @Query(new ZodValidationPipe(SearchSchema)) query: SearchDto,
  // ): Promise<SearchResponse> {
  //   const result = await this.productService.search(query);
  //   return result;
  // }
}
