import {
  CompleteProductCreationPayload,
  CreateOfferPayload,
  CreateProductPayload,
  GetproductsByCategoryPayload,
  PaginationPayload,
  RedirectToProductPagePayload,
  SearchPayload,
} from "../dto";
import { ITempProduct } from "src/drizzle/schemas/temp-product.schema";
import { Request } from "express";
import {
  IProduct,
  IProductOffer,
  IProductRecord,
  IProductView,
} from "src/drizzle/schemas";

export interface IProductService {
  createProduct(
    userId: string,
    shopId: string,
    payload: CreateProductPayload,
  ): Promise<ITempProduct>;

  completeProductCreation(
    userId: string,
    productId: string,
    payload: CompleteProductCreationPayload,
  ): Promise<IProduct>;

  createOffer(
    userId: string,
    productId: string,
    payload: CreateOfferPayload,
  ): Promise<IProductOffer>;

  uploadImages(
    userId: string,
    productId: string,
    isTemp: boolean,
    files: {
      thumbnailImage: Express.Multer.File;
      images: Express.Multer.File[];
    },
  ): Promise<void>;

  redirectToProductPage(
    req: Request,
    params: RedirectToProductPagePayload,
  ): Promise<string>;

  getProduct(productId: string): Promise<IProductView>;
  getSimilarProduct(
    productId: string,
    params: PaginationPayload,
  ): Promise<IProductRecord[]>;
  toggleLike(userId: string, productId: string): Promise<void>;
  search(params: SearchPayload): Promise<any>;
  getProductsByCategory(params: GetproductsByCategoryPayload): Promise<any>;
  deleteTempProduct(userId: string, tempProductId: string): Promise<void>;
}
