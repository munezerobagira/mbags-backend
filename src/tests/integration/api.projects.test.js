/* eslint-disable func-names */

import chaiHttp from "chai-http";
import chai, { expect } from "chai";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { join as joinPath } from "path";
import { existsSync } from "fs";
import { createUser } from "../../models/User";
import server from "../..";
import { createBanner } from "../../helpers/bannerCreator";
import {
  createImageTestingFolder,
  deleteImageTestingFolder,
} from "../../testFunctions";

chai.use(chaiHttp);
const { request } = chai;
// let validCategoryId;
describe.skip("/api/project", function projectTest() {
  let validProjectId;
  let invalidProjectId;
  let token;
  let guestToken;
  let testingImageFolder;
  this.timeout(30000);
  before(async () => {
    await mongoose.connection.asPromise();
    testingImageFolder = await createImageTestingFolder();
    expect(testingImageFolder).to.be.a("string");
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
    const inputPath = joinPath(
      testingImageFolder,
      faker.random.alphaNumeric(12)
    );
    const image = await createBanner("test", { inputPath });
    const response = await request(server)
      .post("/api/projects")
      .field("title", faker.company.catchPhrase())
      .field("summary", faker.company.catchPhraseDescriptor())
      .field("link", faker.internet.avatar())
      .field("categories", faker.fake("{{random.word}}, {{random.word}}"))
      .attach("image", image)
      .set("Authorization", `Bearer ${token}`);

    validProjectId = response.body?.project?._id;
    invalidProjectId = faker.random.alphaNumeric(16);
    validCategoryId = response.body?.project?.categories[0];
  });
  after(async () => {
    await deleteImageTestingFolder();
    expect(existsSync(testingImageFolder)).to.be(false);
  });
  describe("GET /", () => {
    it("should return 401 if token is not provided", async () => {
      const response = await request(server).get("/api/articles");
      expect(response).to.have.status(401);
    });
    it("should return 200  and articles if valid token  is provided", async () => {
      const response = await request(server)
        .get("/api/projects")
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.property("projects");
    });
  });

  describe("POST /", () => {
    it("should return 401 if token  is not given", async () => {
      const response = await request(server).post("/api/articles/");
      expect(response).to.have.status(401);
    });
    it("should return 400 if invalid data is  provided", async () => {
      const response = await request(server)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(400);
    });
    it("should return 201 created if image is not provided", async () => {
      const response = await request(server)
        .post("/api/project")
        .field("title", faker.company.catchPhrase())
        .field("summary", faker.company.catchPhraseDescriptor())
        .field("link", faker.internet.avatar())
        .field("categories", faker.fake("{{random.word}}, {{random.word}}"))
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(201);
    });
    it("should return 201 status and created article if token  provided and messages", async () => {
      const inputPath = joinPath(
        testingImageFolder,
        faker.random.alphaNumeric(12)
      );
      const image = await createBanner("test", { inputPath });
      const response = await request(server)
        .post("/api/projects")
        .field("title", faker.company.catchPhrase())
        .field("summary", faker.company.catchPhraseDescriptor())
        .field("content", faker.lorem.paragraphs(3))
        .field("categories", faker.lorem.words(3))
        .attach("image", image, "test.png")
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(201);
      expect(response.body).to.have.property("article");
    });
  });
  describe("PATCH /:id", () => {
    it("should return 401 if token  is not given", async () => {
      const response = await request(server).patch(
        `/api/projects/${validProjectId}`
      );
      expect(response).to.have.status(401);
    });
    it("should return 400 if invalid data is given", async () => {
      const response = await request(server)
        .patch(`/api/articles/${validProjectId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          featured: 12.3,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(400);
    });
    it("should return 404 if  articleId is invalid", async () => {
      const response = await request(server)
        .patch(`/api/projects/${invalidProjectId}`)
        .send({
          title: "changed",
          summary: "changed",
          content: "changed",
          categories: "changed",
          published: true,
          featured: true,
        })
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(404);
    });
    it("should return 200  and message if token  provided and messages", async () => {
      const response = await request(server)
        .patch(`/api/projects/${validProjectId}`)
        .send({
          title: "changed",
          summary: "changed",
          content: "changed",
          categories: "changed",
          link: faker.internet.avatar(),
          published: true,
          featured: true,
        })
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.property("article");
    });
  });
  describe("GET /:id", () => {
    it("should return 401 if token  is not given", async () => {
      const response = await request(server).get(
        `/api/articles/${validProjectId}`
      );
      expect(response).to.have.status(401);
    });
    it("should return 404 if invalid id is given", async () => {
      const response = await request(server)
        .get(`/api/articles/${invalidProjectId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(404);
    });
    it("should return 200 with message if valid  id and token are provided", async () => {
      const response = await request(server)
        .get(`/api/articles/${validProjectId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(200);
      expect(response.body).to.have.property("article");
    });
    describe("DELETE /:id", () => {
      it("should return 401 if token  is not given", async () => {
        const response = await request(server).delete(
          `/api/articles/${validProjectId}`
        );
        expect(response).to.have.status(401);
      });
      it("should return 404 if invalid id is given", async () => {
        const response = await request(server)
          .delete(`/api/projects/${validProjectId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response).to.have.status(404);
      });
      it("should return 200 if valid  id and token are provided", async () => {
        const response = await request(server)
          .delete(`/api/projects/${validProjectId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(200);
      });
    });
  });
});
