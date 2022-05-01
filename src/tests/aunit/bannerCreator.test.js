import { expect } from "chai";
import { join as joinPath } from "path";
import { existsSync } from "fs";

import {
  createImageTestingFolder,
  deleteImageTestingFolder,
} from "../../testFunctions";
import { createBanner } from "../../helpers/bannerCreator";

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
    const imagePath = await createBanner("Welcome to our website", {
      inputPath: inputPath,
    });
    expect(existsSync(imagePath)).to.be.true;
  });
});
