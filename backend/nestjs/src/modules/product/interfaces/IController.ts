import { CreateProductDto, SearchDto } from "../dto";
import { SearchResponse } from "../types";
import { ITempProduct } from "src/drizzle/schemas/temp-product.schema";

export interface IProductController {
  createProduct(
    userId: string,
    shopId: string,
    payload: CreateProductDto,
  ): Promise<ITempProduct>;
  search(query: SearchDto): Promise<SearchResponse>;
}
