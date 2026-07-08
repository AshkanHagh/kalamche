export function generateAsin() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let asin = characters.charAt(Math.floor(Math.random() * 26));
  for (let i = 0; i < 9; i++) {
    asin += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return asin;
}
