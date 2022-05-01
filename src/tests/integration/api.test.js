/* eslint-disable func-names */
import chaiHttp from "chai-http";
import chai, { expect } from "chai";
import { describe, it } from "mocha";

import server from "../..";

chai.use(chaiHttp);
const { request } = chai;

describe("API test", () => {
  describe("/", () => {
    it("should return 404", async () => {
      const res = await request(server).get("/");
      expect(res).to.have.status(404);
    });
  });
  describe("Base /api", () => {
    it("should return 200", async () => {
      const response = await request(server).get("/api");
      expect(response).to.have.status(200);
    });
  });
});
