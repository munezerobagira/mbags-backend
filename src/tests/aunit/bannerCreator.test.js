import { expect } from "chai";
import { createBanner } from "../../helpers/bannerCreator";
import { join as joinPath } from "path";
import {
  createImageTestingFolder,
  deleteImageTestingFolder,
} from "../../testFunctions";
import { existsSync } from "fs";

describe("createBanner(name, {options})", () => {
  let testingImageFolder;
  before(async () => {
    testingImageFolder = await createImageTestingFolder();
    expect(testingImageFolder).to.be.a("string");
  });
  after(async () => {
    await deleteImageTestingFolder();
    expect(existsSync(testingImageFolder)).to.be.false;
  });
  it("should create Image", async () => {
    let inputPath = joinPath(testingImageFolder, "test");
    console.log(inputPath);
    const imagePath = await createBanner("Welcome to our website", {
      inputPath: inputPath,
    });
    expect(existsSync(imagePath)).to.be.true;
  });
});
