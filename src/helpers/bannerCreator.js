import fs from "fs";
import { createCanvas } from "canvas";

export const createBanner = async (
  title,
  { width = 1200, height = 630, inputPath = "temp" }
) => {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    context.fillStyle = "#555";
    context.fillRect(0, 0, width, height);

    context.font = `bold ${parseInt(width / title.length)}pt Menlo`;
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = "#d9c407";

    const textWidth = context.measureText(title).width;
    context.fillRect(600 - textWidth / 2 - 10, 170 - 5, textWidth + 20, 120);
    context.fillStyle = "#333";
    context.fillText(title, 600, 170);

    context.fillStyle = "#fff";
    context.font = `bold ${parseInt(width / title.length)}px Menlo`;
    context.fillText("sostene.dev", 600, 530);

    const buffer = canvas.toBuffer("image/png");
    let imagePath = inputPath + ".png";
    fs.writeFile(imagePath, buffer, (error) => {
      if (error) resolve(error);
      if (fs.existsSync(imagePath)) resolve(imagePath);
    });
  });
};
