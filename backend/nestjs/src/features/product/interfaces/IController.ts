import {
  CompleteProductCreationDto,
  CreateOfferDto,
  CreateProductDto,
  GetProductsByCategoryDto,
  PaginationDto,
  RedirectToProductPageDto,
  SearchDto,
  UpdateProductDto,
} from "../dto";
import { ITempProduct } from "src/drizzle/schemas/temp-product.schema";
import { Request } from "express";
import {
  IProduct,
  IProductOffer,
  IProductRecord,
  IProductView,
} from "src/drizzle/schemas";

export interface IProductController {
  createProduct(
    userId: string,
    shopId: string,
    payload: CreateProductDto,
  ): Promise<ITempProduct>;

  completeProductCreation(
    userId: string,
    productId: string,
    payload: CompleteProductCreationDto,
  ): Promise<IProduct>;

  createOffer(
    userId: string,
    productId: string,
    payload: CreateOfferDto,
  ): Promise<IProductOffer>;

  uploadImages(
    userId: string,
    productId: string,
    isTemp: boolean,
    files: {
      thumbnailImage: Express.Multer.File[];
      images: Express.Multer.File[];
    },
  ): Promise<void>;

  redirectToProductPage(
    req: Request,
    params: RedirectToProductPageDto,
  ): Promise<{ url: string; statusCode: number }>;

  getProduct(productId: string): Promise<IProductView>;
  getSimilarProduct(
    productId: string,
    params: PaginationDto,
  ): Promise<IProductRecord[]>;
  toggleLike(userId: string, productId: string): Promise<void>;
  search(params: SearchDto): Promise<any>;
  getProductsByCategory(params: GetProductsByCategoryDto): Promise<any>;
  deleteTempProduct(userId: string, tempProductId: string): Promise<void>;
  deleteProduct(userId: string, productId: string): Promise<void>;
  updateProduct(
    userId: string,
    productId: string,
    payload: UpdateProductDto,
  ): Promise<IProduct>;
  updateProductImage(
    userId: string,
    productId: string,
    imageId: string,
    image: Express.Multer.File,
  ): Promise<void>;
}
