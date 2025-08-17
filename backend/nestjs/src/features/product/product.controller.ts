import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Redirect,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  CompleteProductCreationDto,
  CreateOfferDto,
  CreateProductDto,
  GetProductsByCategoryDto,
  PaginationDto,
  RedirectToProductPageDto,
  SearchDto,
  UpdateOfferDto,
  UpdateProductDto,
} from "./dto";
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
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { Request } from "express";
import { SkipAuth } from "../auth/decorators/skip-auth.decorator";
import { SkipPermission } from "../auth/decorators/skip-permission.decorator";
import {
  IBrand,
  ICategory,
  IProduct,
  IProductOffer,
  IProductRecord,
  IProductView,
} from "src/drizzle/schemas";
import { ApiFile, ApiParams, ApiQuery } from "src/utils/swagger-decorator";
import { MAX_IMAGE_SIZE, MAX_IMAGES } from "./constants";

@Controller("products")
@UseGuards(AuthorizationGuard, PermissionGuard)
export class ProductController implements IProductController {
  constructor(private productService: ProductService) {}

  @Post("/:shop_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async createProduct(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
    @Body() payload: CreateProductDto,
  ) {
    return this.productService.createProduct(userId, shopId, payload);
  }

  @Patch("/complete/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  async completeProductCreation(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Body() payload: CompleteProductCreationDto,
  ) {
    return this.productService.completeProductCreation(
      userId,
      productId,
      payload,
    );
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

  @Post("/images/:product_id")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: "thumbnailImage",
          maxCount: 1,
        },
        {
          name: "images",
          maxCount: 5,
        },
      ],
      {
        limits: {
          fileSize: MAX_IMAGE_SIZE,
          fieldSize: MAX_IMAGE_SIZE * MAX_IMAGES,
        },
      },
    ),
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

  @ApiParams({ type: RedirectToProductPageDto })
  @Get("/redirect-offer-page/:shopId/:productId")
  @SkipAuth()
  @SkipPermission()
  @Redirect()
  async redirectToProductPage(
    @Req() req: Request,
    @Param() params: RedirectToProductPageDto,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.productService.redirectToProductPage(req, params);
    return { url, statusCode: 302 };
  }

  @ApiQuery({ type: PaginationDto })
  @Get("/similar/:product_id")
  @SkipAuth()
  @SkipPermission()
  async getSimilarProduct(
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Query() params: PaginationDto,
  ): Promise<IProductRecord[]> {
    return await this.productService.getSimilarProduct(productId, params);
  }

  @Patch("/like/:product_id")
  @SkipPermission()
  async toggleLike(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
  ): Promise<void> {
    await this.productService.toggleLike(userId, productId);
  }

  @ApiQuery({ type: SearchDto })
  @Get("/")
  @SkipAuth()
  @SkipPermission()
  async search(@Query() params: SearchDto) {
    return await this.productService.search(params);
  }

  @Get("/brands")
  @SkipAuth()
  @SkipPermission()
  async getBrands(): Promise<IBrand[]> {
    return await this.productService.getBrands();
  }

  @Get("/categories")
  @SkipAuth()
  @SkipPermission()
  async getCategories(): Promise<ICategory[]> {
    return await this.productService.getCategories();
  }

  @ApiQuery({ type: GetProductsByCategoryDto })
  @Get("/categories/:slug")
  @SkipAuth()
  @SkipPermission()
  async getProductsByCategory(
    @Param("slug") slug: string,
    @Query() params: GetProductsByCategoryDto,
  ): Promise<any> {
    return await this.productService.getProductsByCategory(slug, params);
  }

  @Get("/:product_id")
  @SkipAuth()
  @SkipPermission()
  async getProduct(
    @Param("product_id", new ParseUUIDPipe()) productId: string,
  ): Promise<IProductView> {
    return await this.productService.getProduct(productId);
  }

  @Delete("/temp/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.DELETE)
  async deleteTempProduct(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) tempProductId: string,
  ): Promise<void> {
    await this.productService.deleteTempProduct(userId, tempProductId);
  }

  @Delete("/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.DELETE)
  async deleteProduct(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) tempProductId: string,
  ): Promise<void> {
    await this.productService.deleteProduct(userId, tempProductId);
  }

  @Patch("/:product_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.UPDATE)
  async updateProduct(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Body() payload: UpdateProductDto,
  ): Promise<IProduct> {
    return await this.productService.updateProduct(userId, productId, payload);
  }

  @ApiFile("image", {
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
          description: "File to upload (e.g., image)",
        },
      },
      required: ["image"],
    },
  })
  @Patch("/:product_id/images/:image_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.UPDATE)
  @UseInterceptors(FileInterceptor("image"))
  async updateProductImage(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
    @Param("image_id", new ParseUUIDPipe()) imageId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpeg|jpg|png)$/i,
        })
        .addMaxSizeValidator({ maxSize: MAX_IMAGE_SIZE })
        .build({ fileIsRequired: true }),
    )
    image: Express.Multer.File,
  ): Promise<void> {
    await this.productService.updateProductImage(
      userId,
      productId,
      imageId,
      image,
    );
  }

  @Patch("offers/:offer_id")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.UPDATE)
  async updateOffer(
    @User("id") userId: string,
    @Param("offer_id", new ParseUUIDPipe()) offerId: string,
    @Body() payload: UpdateOfferDto,
  ): Promise<IProductOffer> {
    return await this.productService.updateOffer(userId, offerId, payload);
  }
}
