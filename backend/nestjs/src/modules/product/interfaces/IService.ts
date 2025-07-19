import { CreateProductDto, SearchDto } from "../dto";
import { SearchResponse } from "../types";
import { ITempProduct } from "src/drizzle/schemas/temp-product.schema";

export interface IProductService {
  createProduct(
    userId: string,
    shopId: string,
    payload: CreateProductDto,
  ): Promise<ITempProduct>;
  search(query: SearchDto): Promise<SearchResponse>;
}
