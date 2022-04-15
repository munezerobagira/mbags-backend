const fs = require("fs");
const { createCanvas } = require("canvas");
const { join: joinPath } = require("path");

// loadImage("./logo.png").then((image) => {
// context.drawImage(image, 340, 515, 70, 70);

// });

const createBanner = async (
  title,
  { width = 1200, height = 630, outputName = "Testing" }
) => {
  return new Promise((reject, resolve) => {
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
    outputName += ".png";
    const outputDir = joinPath(__dirname, outputName);
    fs.writeFile(outputName, buffer, (error) => {
      if (error) reject(error);
      resolve(outputDir);
    });
  });
};
const output = async () => {
  try {
    const name = await createBanner(
      `How to make the most amazing banner ever
     without using the main user`,
      {
        outputName: "banner",
      }
    );
  } catch (error) {
    console.log(error);
  }
};
output();
