process.env.PORT = undefined;
import { port } from "../../config";
import chai, { expect } from "chai";
import { port as secondport } from "../../config";

describe("port", () => {
  it(" should be defined if PORT ENV is not given", async () => {
    expect(port).to.exist;
  });
});
