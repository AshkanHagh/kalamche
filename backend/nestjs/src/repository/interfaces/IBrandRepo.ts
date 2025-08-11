export interface IBrandRepo {
  exists(id: string): Promise<void>;
}
