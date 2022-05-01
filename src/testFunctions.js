import fs from "fs";
import { join as joinPath } from "path";

let testingImageFolder = joinPath(__dirname, "public", "tests");
export function createImageTestingFolder() {
  return new Promise((resolve) => {
    testingImageFolder = joinPath(__dirname, "public", "tests");
    if (!fs.existsSync(testingImageFolder))
      fs.mkdirSync(testingImageFolder, { recursive: true });
    if (fs.existsSync(testingImageFolder)) resolve(testingImageFolder);
  });
}
export function deleteImageTestingFolder() {
  return new Promise((resolve) => {
    if (fs.existsSync(testingImageFolder))
      fs.rmSync(testingImageFolder, {
        recursive: true,
      });
    if (!fs.existsSync(testingImageFolder)) resolve();
  });
}
