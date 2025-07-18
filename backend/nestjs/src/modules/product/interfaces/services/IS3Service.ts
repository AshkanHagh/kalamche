export interface IS3Service {
  putObject(
    id: string,
    mimeType: string,
    buffer: Buffer,
    temp?: boolean,
  ): Promise<string>;
  delete(id: string): Promise<void>;
}
