/* eslint-disable func-names */
import chaiHttp from "chai-http";
import chai, { expect } from "chai";
import { faker } from "@faker-js/faker";
import { existsSync } from "fs";
import server from "../..";
import { createUser } from "../../models/User";
import { createBanner } from "../../helpers/bannerCreator";
import {
  createImageTestingFolder,
  deleteImageTestingFolder,
} from "../../testFunctions";
import { signToken } from "../../helpers/jwt";
import { verificationSecret } from "../../config";
import { UserServive } from "../../services";

chai.use(chaiHttp);
const { request } = chai;

describe("/api/user", function () {
  let token;
  let guestToken;
  let unverifiedUser;
  let guest;
  let testingImageFolder;
  this.timeout(60000);

  before(async () => {
    testingImageFolder = await createImageTestingFolder();
    expect(testingImageFolder).to.be.a("string");
    const password = faker.internet.password();
    guest = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      username: faker.internet.userName(),
      verified: true,
    };
    unverifiedUser = {
      name: faker.name.findName(),
      email: "bagira.sostenee@gmail.com",
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
    guest = await createUser(guest);
    unverifiedUser = await createUser(unverifiedUser);
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
    await deleteImageTestingFolder();
    expect(existsSync(testingImageFolder)).to.equal(false);
  });
  describe("GET /api/user/profile", async () => {
    it("should return 401 if token  is not given", async () => {
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
    it("should return 200 if valid  id and token are provided", async () => {
      const profilePic = await createBanner("profilePic", {
        inputPath: testingImageFolder,
      });
      const response = await request(server)
        .patch("/api/user/profile")
        .field("summary", faker.company.catchPhrase())
        .field("info", faker.lorem.lines(2))
        .field("keywords", faker.fake("{{random.word}}, {{random.word}}"))
        .set("Authorization", `Bearer ${token}`)
        .attach("profilePic", profilePic);
      expect(response).to.have.status(200);
      expect(response.body).to.have.property("user");
    });
  });
  describe("GET /api/user/profile/verification", async () => {
    this.timeout(20000);
    it("should return 400 if id not provided", async () => {
      const response = await request(server).get(
        `/api/user/profile/verification`
      );
      expect(response).to.have.status(400);
    });
    it("should return 404 if  no user associated  provided id ", async () => {
      const response = await request(server).get(
        `/api/user/profile/verification?id=${faker.datatype.uuid()}`
      );
      expect(response).to.have.status(404);
    });
    it("should return 400 if email is already verified", async () => {
      const response = await request(server).get(
        `/api/user/profile/verification?id=${guest._id}`
      );
      expect(response).to.have.status(400);
    });
    it("should return 200 if valid  id and token are provided", async () => {
      const response = await request(server).get(
        `/api/user/profile/verification?id=${unverifiedUser._id}`
      );
      expect(response).to.have.status(200);
    });
  });

  describe("PATCH /api/user/profile/verification", async () => {
    this.timeout(20000);
    it("should return 400 if token is  not provided", async () => {
      const response = await request(server).patch(
        `/api/user/profile/verification`
      );
      expect(response).to.have.status(400);
    });
    it("should return 401 if  token is invalid  id ", async () => {
      const response = await request(server).patch(
        `/api/user/profile/verification?token=${faker.datatype.uuid()}`
      );
      expect(response).to.have.status(401);
    });

    it("should return 401 if token is not associated with the user", async () => {
      const verifyToken = await signToken(
        { user: { id: unverifiedUser._id } },
        verificationSecret,
        {
          expiresIn: "12h",
        }
      );
      const response = await request(server).patch(
        `/api/user/profile/verification?token=${verifyToken}`
      );

      expect(response).to.have.status(401);
    });
    it("should return 200 if token is associated with the user", async () => {
      const verifyToken = await signToken(
        { user: { id: unverifiedUser._id } },
        verificationSecret,
        {
          expiresIn: "2h",
        }
      );
      await UserServive.updateUser(unverifiedUser._id, {
        token: { action: "add", value: verifyToken },
      });
      const response = await request(server).patch(
        `/api/user/profile/verification?token=${verifyToken}`
      );
      expect(response).to.have.status(200);
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
