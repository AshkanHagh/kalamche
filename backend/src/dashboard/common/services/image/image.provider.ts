export type ImageResource = {
  id: string;
  url: string;
};

export abstract class ImageProvider {
  abstract upload(buffer: Buffer): Promise<ImageResource>;
  abstract checkImageExists(id: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
