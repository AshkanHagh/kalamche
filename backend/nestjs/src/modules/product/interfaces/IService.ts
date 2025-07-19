import { IProduct } from "src/drizzle/types";
import {
  CompleteProductCreationDto,
  CreateProductDto,
  SearchDto,
} from "../dto";
import { SearchResponse } from "../types";
import { ITempProduct } from "src/drizzle/schemas/temp-product.schema";

export interface IProductService {
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
  search(query: SearchDto): Promise<SearchResponse>;
}
