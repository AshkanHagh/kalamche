import { Controller, Get, Query } from "@nestjs/common";
import { IProductController } from "./interfaces/controller";
import { SearchDto, SearchSchema } from "./dto";
import { SearchResponse } from "./types";
import { ZodValidationPipe } from "src/utils/zod-validation.pipe";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController implements IProductController {
  constructor(private productService: ProductService) {}

  @Get("/")
  async search(
    @Query(new ZodValidationPipe(SearchSchema)) query: SearchDto,
  ): Promise<SearchResponse> {
    const result = await this.productService.search(query);
    return result;
  }
}
