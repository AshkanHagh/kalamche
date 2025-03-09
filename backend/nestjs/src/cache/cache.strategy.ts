export interface CacheStrategy {
  get<T>(key: string): Promise<T | undefined>;

  set<T>(key: string, value: T, expireIn: number): Promise<void>;

  delete(key: string): Promise<void>;

  close(): Promise<void> | void;

  clear(): Promise<void> | void;
}
