export function getImageNameFromUrl(url: string) {
  return url.split("/").at(-1)!;
}
