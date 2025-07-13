import { SearchDto } from "../dto";
import { SearchResponse } from "../types";

export interface IProductController {
  search(query: SearchDto): Promise<SearchResponse>;
}
