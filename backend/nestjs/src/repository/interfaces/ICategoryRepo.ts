export interface ICategoryRepo {
  exists(id: string): Promise<void>;
}
