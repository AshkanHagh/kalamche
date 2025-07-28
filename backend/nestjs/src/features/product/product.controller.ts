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
  Redirect,
  Req,
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
  RedirectToProductPageDto,
  RedirectToProductPageSchema,
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
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { SkipAuth } from "../auth/decorators/skip-auth.decorator";
import { SkipPermission } from "../auth/decorators/skip-permission.decorator";

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
  ) {
    return this.productService.createProduct(userId, shopId, payload);
  }

  @Patch("/complete/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async completeProductCreation(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Body(new ZodValidationPipe(CompleteProductCreationSchema))
    payload: CompleteProductCreationDto,
  ) {
    return this.productService.completeProductCreation(
      userId,
      productId,
      payload,
    );
  }

  @Post("/offer/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  createOffer(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Body(new ZodValidationPipe(CreateOfferSchema))
    payload: CreateOfferDto,
  ) {
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
  ) {
    await this.productService.uploadImages(userId, productId, isTemp, {
      thumbnailImage: files.thumbnailImage
        ? files.thumbnailImage[0]
        : undefined,
      images: files.images || [],
    });
  }

  @Get("/redirect-offer-page/:shopId/:productId")
  @SkipAuth()
  @SkipPermission()
  @Redirect()
  async redirectToProductPage(
    @Req() req: Request,
    @Param(new ZodValidationPipe(RedirectToProductPageSchema))
    params: RedirectToProductPageDto,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.productService.redirectToProductPage(req, params);
    return { url, statusCode: 302 };
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
