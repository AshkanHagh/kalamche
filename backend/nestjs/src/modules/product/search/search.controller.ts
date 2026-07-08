import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { SearchService } from "./search.service";

type ProductPayload = {
  id: string;
};

@Controller()
export class SearchController {
  constructor(private searchService: SearchService) {}

  @EventPattern("product-created")
  async indexProduct(@Payload() payload: ProductPayload) {
    await this.searchService.indexProduct(payload.id);
  }

  @EventPattern("product-offer-created")
  async updateProductOffer(@Payload() payload: ProductPayload) {
    await this.searchService.updateProductOffer(payload.id);
  }
}
