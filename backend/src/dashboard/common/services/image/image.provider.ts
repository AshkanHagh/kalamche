export type ImageResource = {
  id: string;
  url: string;
};

export abstract class ImageProvider {
  abstract upload(file: Express.Multer.File): Promise<ImageResource>;
  abstract delete(id: string): Promise<void>;
}
