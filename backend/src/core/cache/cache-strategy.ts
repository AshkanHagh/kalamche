/**
 * @description
 * A type representing JSON-compatible values.
 * From https://github.com/microsoft/TypeScript/issues/1897#issuecomment-580962081
 *
 * @docsCategory common
 */
export type JsonCompatible<T> = {
  [P in keyof T]: T[P] extends JSON
    ? T[P]
    : Pick<T, P> extends Required<Pick<T, P>>
      ? never
      : JsonCompatible<T[P]>;
};

export interface CacheStrategy {
  get<T extends JsonCompatible<T>>(key: string): Promise<T | undefined>;
  set<T extends JsonCompatible<T>>(
    key: string,
    value: T,
    expireIn: number,
  ): Promise<void>;

  delete(key: string): Promise<void>;
}
