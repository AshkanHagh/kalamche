import {
  CompleteProductCreationDto,
  CreateOfferDto,
  CreateProductDto,
  PaginationDto,
  RedirectToProductPageDto,
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

  // search(query: SearchDto): Promise<SearchResponse>;
}
