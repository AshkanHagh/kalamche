import { Injectable } from "@nestjs/common";
import { IProductService } from "./interfaces/service";
import { SearchDto } from "./dto";
import { SearchResponse } from "./types";
import { ProductRepository } from "src/repository/repositories/product.repository";

@Injectable()
export class ProductService implements IProductService {
  constructor(private productRepository: ProductRepository) {}

  // TODO: add filter for same products(only the cheapest most be on serach resutl)
  async search(query: SearchDto): Promise<SearchResponse> {
    const result = await this.productRepository.findProductsByFilter(
      query.sort,
      query.brand,
      query.q,
      query.prMax,
      query.prMin,
      query.limit,
      query.offset,
    );

    const hasNext = result.length > query.limit;
    result.pop();

    if (result.length === 0) {
      return {
        products: [],
        hasNext: false,
      };
    }

    // we use most matched product to query brand name to find related brands
    // NOTE: for the example dataset of products thet the brands might not match to
    // kalamche default brands in production remove the ? : []
    // const brand = BrandsDataset.find((brand) => brand.key === result[0].brand);
    // const relatedBrands = brand
    //   ? BrandsDataset.filter((b) => b.type === brand.type)
    //   : [];
    const relatedBrands = [];

    const priceRange = {
      min: result[0].minPrice,
      max: result[0].maxPrice,
    };
    const products = result.map((p) => ({
      id: p.product.id,
      name: p.product.name,
      price: p.offer!.price,
      sellerName: p.shop!.name,
      imageUrl: p.image?.url || "",
    }));

    return {
      brands: relatedBrands,
      priceRange,
      products: [],
      hasNext,
    };
  }
}
