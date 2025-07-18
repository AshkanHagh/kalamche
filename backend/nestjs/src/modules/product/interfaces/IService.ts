import { SearchDto } from "../dto";
import { SearchResponse } from "../types";

export interface IProductService {
  search(query: SearchDto): Promise<SearchResponse>;
}
