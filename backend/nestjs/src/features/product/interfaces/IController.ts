import { IProduct, IProductOffer } from "src/drizzle/types";
import {
  CompleteProductCreationDto,
  CreateOfferDto,
  CreateProductDto,
} from "../dto";
import { ITempProduct } from "src/drizzle/schemas/temp-product.schema";

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
  // search(query: SearchDto): Promise<SearchResponse>;
}
