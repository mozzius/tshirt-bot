import path from "path";
import sharp from "sharp";

const tshirt = path.join(__dirname, "assets", "tshirt.png");
const logo = path.join(__dirname, "assets", "logo.png");
const buy = path.join(__dirname, "assets", "buy.png");

export const createImage = async (src: string) => {
  const design = await fetch(src).then((res) => res.arrayBuffer());
  return sharp({
    create: {
      width: 1200,
      height: 650,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  }).composite([
    { input: await sharp(tshirt).resize(650, 650).toBuffer() },
    {
      input: await sharp(design)
        .resize(650 * 0.5)
        .toBuffer(),
    },
    {
      input: await sharp(logo)
        .resize(800)
        .rotate(-15, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer(),
      top: -20,
      left: -20,
    },
    {
      input: await sharp(buy)
        .resize(400)
        .rotate(5, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer(),
      top: 450,
      left: 700,
    },
  ]);
};
