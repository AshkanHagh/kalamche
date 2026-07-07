import sharp from "sharp";

type Payload = {
  id: string;
  imageBuffer: Buffer;
};

export type ImageResize = {
  id: string;
  buffer: ArrayBuffer;
};

export default async function ({ id, imageBuffer }: Payload) {
  const fileBuffer = await sharp(imageBuffer)
    .resize({
      height: 800,
      width: 800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  // removing the 8kb pool size that nodejs put there
  return {
    id,
    buffer: fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    ),
  };
}
