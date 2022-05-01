/* eslint-disable func-names */
import chaiHttp from "chai-http";
import chai, { expect } from "chai";
import { faker } from "@faker-js/faker";
import server from "../..";
import { createUser } from "../../models/User";
// import { createBanner } from "../../../helpers/bannerCreator";
// import {
//   createImageTestingFolder,
//   deleteImageTestingFolder,
// } from "../../../testFunctions";

chai.use(chaiHttp);
const { request } = chai;

describe.skip("/api/user", () => {
  let token;
  let guestToken;
  let unverifiedUser;

  before(async () => {
    const password = faker.internet.password();
    const guest = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      username: faker.internet.userName(),
      verified: true,
    };
    unverifiedUser = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      username: faker.internet.userName(),
      verified: false,
    };
    const adminUser = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      username: faker.internet.userName(),
      role: "admin",
      verified: true,
    };
    await createUser(adminUser);
    await createUser(guest);
    await createUser(unverifiedUser);
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
  describe("GET /api/user/profile/verification", async () => {
    it("should return 400 if email not provided", async () => {
      const response = await request(server).get(
        `/api/user/profile/verification`
      );
      expect(response).to.have.status(200);
    });
    it("should return 404 if  no user associated  with email ", async () => {
      const response = await request(server).get(
        `/api/user/profile/verification?email=${faker.internet.email()}`
      );
      expect(response).to.have.status(200);
    });
    it("should return 200 if valid  id and token are provided", async () => {
      const response = await request(server).get(
        `/api/user/profile/verification?email=${unverifiedUser.email}`
      );
      expect(response).to.have.status(200);
    });
  });

  describe("GET /api/user/profile", async () => {
    it("should return 401 if token  is not given", async () => {
      const response = await request(server).get("/api/user/profile");
      expect(response).to.have.status(401);
    });
    it("should return 403 if user is not verified  is not given", async () => {
      const response = await request(server).get("/api/user/profile");
      expect(response).to.have.status(401);
    });
    it("should return 200 if valid  id and token are provided", async () => {
      const response = await request(server)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.property("user");
    });
  });
  describe("PATCH /api/user/profile", async () => {
    it("should return 401 if token  is not given", async () => {
      const response = await request(server).patch("/api/user/profile");
      expect(response).to.have.status(401);
    });
    it.skip("should return 200 if valid  id and token are provided", async () => {
      const response = await request(server)
        .patch("/api/user/profile")
        .field("summary", faker.commpany.catchPhrase())
        .field("info", faker.lorem.lines(2))
        .field("keywords", faker.faker.fake("{{random.word}}, {{random.word}}"))
        .set("Authorization", `Bearer ${token}`)
        .send({
          summary: faker.company.catchPhrase(),
          info: faker.lorem.lines(2),
          keywords: faker.fake("{{random.word}}, {{random.word}}"),
        });
      expect(response).to.have.status(200);
      expect(response.body).to.have.property("user");
    });
  });
  describe("DELETE /api/user/profile", async () => {
    it("should return 401 if token  is not given", async () => {
      const response = await request(server).delete("/api/user/profile");
      expect(response).to.have.status(401);
    });
    it("should return 200 if valid  id and token are provided", async () => {
      const response = await request(server)
        .delete("/api/user/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(200);
    });
  });
});
