/* eslint-disable func-names */
import chaiHttp from "chai-http";
import chai, { expect } from "chai";
import { existsSync } from "fs";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { describe, it, after, before } from "mocha";

import server from "../..";
import {
  createImageTestingFolder,
  deleteImageTestingFolder,
} from "../../testFunctions";
import { createUser } from "../../models/User";

chai.use(chaiHttp);
const { request } = chai;

describe("API test", () => {
  let testingImageFolder;
  before(async () => {
    // Make sure we're connected to the db
    await mongoose.connection.asPromise();
    testingImageFolder = await createImageTestingFolder();
    expect(testingImageFolder).to.be.a("string");
  });
  after(async () => {
    await deleteImageTestingFolder();
    expect(existsSync(testingImageFolder)).to.equal(false);
  });
  describe("/", () => {
    it("should return 404", async () => {
      const res = await request(server).get("/");
      expect(res).to.have.status(404);
    });
  });
  describe("Base /api", function () {
    let token;
    let guestToken;
    this.timeout(10000);

    before(async () => {
      const password = faker.internet.password();
      const guest = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password,
        username: faker.internet.userName(),
      };
      const adminUser = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password,
        username: faker.internet.userName(),
        role: "admin",
      };
      await createUser(adminUser);
      await createUser(guest);
      token = await (
        await request(server)
          .post("/api/auth/login")
          .send({ email: adminUser.email, password })
      ).body.token;
      guestToken = await (
        await request(server)
          .post("/api/auth/login")
          .send({ email: guest.email, password })
      ).body.token;
      expect(token).to.be.a("string");
      expect(guestToken).to.be.a("string");
    });
    after(async () => {
      await server.close();
      await mongoose.disconnect();
    });
    describe("GET /", () => {
      it("should return 200", async () => {
        const response = await request(server).get("/api");
        expect(response).to.have.status(200);
      });
    });
  });
});
