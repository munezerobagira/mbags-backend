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
import { ownerEmail } from "../../config";
import truncateDb from "../../truncateDb";

chai.use(chaiHttp);
const { request } = chai;

describe("/api/articles", function () {
  let validArticleId;
  let invalidArticleId;
  let validCategoryId;
  let token;
  let guestToken;
  let testingImageFolder;
  this.timeout(30000);
  before(async () => {
    // Make sure we're connected to the db
    await mongoose.connection.asPromise();
    await truncateDb();
    testingImageFolder = await createImageTestingFolder();
    expect(testingImageFolder).to.be.a("string");
    const password = faker.internet.password();
    const guest = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      username: faker.internet.userName(),
      role: "guest",
      verified: true,
    };
    const adminUser = {
      name: faker.name.findName(),
      email: ownerEmail,
      password,
      username: faker.internet.userName(),
      verified: true,
      role: "admin",
    };
    await createUser(guest);
    await createUser(adminUser);
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
      .post("/api/articles")
      .field("title", faker.company.catchPhrase())
      .field("summary", faker.company.catchPhraseDescriptor())
      .field("content", faker.lorem.paragraphs(3))
      .field("categories", faker.fake("{{random.word}}, {{random.word}}"))
      .attach("image", image)
      .set("Authorization", `Bearer ${token}`);
    validArticleId = response.body?.article?._id;
    invalidArticleId = faker.random.alphaNumeric(16);
    validCategoryId = response.body?.article?.categories[0];
    expect(validCategoryId).to.be.a("string");
  });
  after(async () => {
    await deleteImageTestingFolder();
    expect(existsSync(testingImageFolder)).to.equal(false);
  });
  describe("GET /api/articles/", () => {
    it("should return 200  and articles if valid token  is provided", async () => {
      const response = await request(server).get("/api/articles");
      expect(response).to.have.status(200);
      expect(response.body).to.have.property("articles");
    });
  });

  describe("POST /api/articles/", () => {
    it("should return 401 if token  is not provided", async () => {
      const response = await request(server).post("/api/articles/");
      expect(response).to.have.status(401);
    });
    it("should return 400 if invalid data is  provided", async () => {
      const response = await request(server)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(400);
    });
    it("should return 403 if non admin token", async () => {
      const response = await request(server)
        .post("/api/articles")
        .field("title", faker.company.catchPhrase())
        .field("summary", faker.company.catchPhraseDescriptor())
        .field("content", faker.lorem.paragraphs(3))
        .field("categories", faker.fake("{{random.word}}, {{random.word}}"))
        .set("Authorization", `Bearer ${guestToken}`);
      expect(response).to.have.status(403);
    });
    it("should return 201 created even if image is not provided", async () => {
      const response = await request(server)
        .post("/api/articles")
        .set("Content-Type", "multipart/www-form-urlencoded")
        .field("title", faker.company.catchPhrase())
        .field("summary", faker.company.catchPhraseDescriptor())
        .field("content", faker.lorem.paragraphs(3))
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
        .post("/api/articles")
        .field("title", faker.company.catchPhrase())
        .field("summary", faker.company.catchPhraseDescriptor())
        .field("content", faker.lorem.paragraphs(3))
        .field("categories", faker.lorem.words(3))
        .attach("image", image, "test.png")
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(201);
    });
  });
  describe("PATCH /api/articles/:id", () => {
    it("should return 401 if token  is not provided", async () => {
      const response = await request(server).patch(
        `/api/articles/${validArticleId}`
      );
      expect(response).to.have.status(401);
    });
    it("should return 400 if invalid data is provided", async () => {
      const response = await request(server)
        .patch(`/api/articles/${validArticleId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          featured: 12.3,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(400);
    });
    it("should return 403 if non admin token is provided", async () => {
      const response = await request(server)
        .patch(`/api/articles/${validArticleId}`)
        .set("Authorization", `Bearer ${guestToken}`)
        .send({
          featured: true,
          published: true,
        });

      expect(response).to.have.status(403);
    });
    it("should return 404 if  articleId is invalid", async () => {
      const response = await request(server)
        .patch(`/api/articles/${invalidArticleId}`)
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
        .patch(`/api/articles/${validArticleId}`)
        .send({
          title: "changed",
          summary: "changed",
          content: "changed",
          categories: "changed",
          published: true,
          featured: true,
        })
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.property("article");
    });
  });
  describe("GET /api/articles/:id", () => {
    it("should return 404 if invalid id is provided", async () => {
      const response = await request(server)
        .get(`/api/articles/${invalidArticleId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(404);
    });
    it("should return 200 with message if valid  id and token are provided", async () => {
      const response = await request(server)
        .get(`/api/articles/${validArticleId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(200);
      expect(response.body).to.have.property("article");
    });
  });

  describe("/api/articles/:articleId", () => {
    describe("POST /api/articles/:articleId/comment", async () => {
      it("should return 401 if token  is not provided", async () => {
        const response = await request(server)
          .post(`/api/articles/${validArticleId}/comment`)
          .send({
            comment: "test",
          });
        expect(response).to.have.status(401);
      });
      it("should return 400 if invalid data is provided", async () => {
        let response = await request(server)
          .post(`/api/articles/${validArticleId}/comment`)
          .set("Authorization", `Bearer ${token}`)
          .send({});
        expect(response).to.have.status(400);
        response = await request(server)
          .post(`/api/articles/${validArticleId}/comment`)
          .set("Authorization", `Bearer ${guestToken}`)
          .send({});
        expect(response).to.have.status(400);
      });
      it("should return 404 if articleId is provided", async () => {
        let response = await request(server)
          .post(`/api/articles/${invalidArticleId}/comment`)
          .set("Authorization", `Bearer ${token}`)
          .send({ comment: faker.company.catchPhrase() });
        expect(response).to.have.status(404);
        response = await request(server)
          .post(`/api/articles/${invalidArticleId}/comment`)
          .set("Authorization", `Bearer ${guestToken}`)
          .send({ comment: faker.company.catchPhrase() });
        expect(response).to.have.status(404);
      });
      it("should return 201 if valid data is provided", async () => {
        let response = await request(server)
          .post(`/api/articles/${validArticleId}/comment`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            comment: faker.company.catchPhrase(),
          });
        expect(response).to.have.status(201);
        response = await request(server)
          .post(`/api/articles/${validArticleId}/comment`)
          .set("Authorization", `Bearer ${guestToken}`)
          .send({
            comment: faker.company.catchPhrase(),
          });
        expect(response).to.have.status(201);
      });
    });
  });

  describe("/api/articles/category", () => {
    describe("GET /api/articles/", () => {
      it("should return 200 if valid  id and token are provided", async () => {
        const response = await request(server)
          .get("/api/articles/categories")
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(200);
        expect(response.body).to.have.property("categories");
      });
    });
    describe("GET /api/articles/categories/:id", () => {
      it("should return 404 if invalidId is  provided", async () => {
        const response = await request(server).get(
          "/api/articles/categories/test"
        );
        expect(response).to.have.status(404);
      });
      it("should return 200 if valid  id and token are provided", async () => {
        let response = await request(server).get(
          `/api/articles/categories/${validCategoryId}`
        );
        expect(response).to.have.status(200);
        expect(response.body).to.have.property("category");
        response = await request(server)
          .get(`/api/articles/categories/${validCategoryId}?categories=true`)
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(200);
        expect(response.body).to.have.property("category");
      });
    });
    describe("PATCH /api/articles/:category", () => {
      it("should return 401 if token  is not provided", async () => {
        const response = await request(server).patch(
          `/api/articles/categories/${validCategoryId}`
        );
        expect(response).to.have.status(401);
      });
      it("should return 403 if non admin token  provided", async () => {
        const response = await request(server)
          .patch(`/api/articles/categories/${validCategoryId}`)
          .set("Authorization", `Bearer ${guestToken}`);

        expect(response).to.have.status(403);
      });
      it("should return 404 if invalidId provided", async () => {
        const response = await request(server)
          .patch(`/api/articles/categories/${invalidArticleId}`)
          .send({
            description: "Welcome",
            title: "welcome",
          })
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(404);
      });
      it("should return 200 if valid  id and token are provided", async () => {
        const response = await request(server)
          .patch(`/api/articles/categories/${validCategoryId}`)
          .send({
            title: "new",
            description: faker.company.catchPhraseDescriptor(),
          })
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(200);
        expect(response.body).to.have.property("category");
      });
    });
  });
  describe("/api/articles/comments", () => {
    let validCommentId;
    before(async () => {
      const response = await request(server)
        .post(`/api/articles/${validArticleId}/comment`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          comment: faker.company.catchPhrase(),
        });
      validCommentId = response?.body?.comment?._id;
    });
    describe("GET /api/articles/comments/", () => {
      it("should return 200 and comments if valid  id and token are provided", async () => {
        const response = await request(server)
          .get("/api/articles/comments/")
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(200);
        expect(response.body).to.have.property("comments");
      });
    });
    describe("GET /api/articles/comments/:id", () => {
      it("should return 404 if token  invalid id is provided", async () => {
        const response = await request(server)
          .get(`/api/articles/comments/${invalidArticleId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(404);
      });
      it("should return 200 if valid  id and token are provided", async () => {
        const response = await request(server)
          .get(`/api/articles/comments/${validCommentId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(200);
        expect(response.body).to.have.property("comment");
      });
    });
    describe("PATCH /api/articles/comments/:id", () => {
      it("should return 401 if token  is not provided", async () => {
        const response = await request(server).patch(
          `/api/articles/comments/${validCommentId}`
        );
        expect(response).to.have.status(401);
      });
      it("should return 404 if comment id is invalid", async () => {
        const response = await request(server)
          .patch(`/api/articles/comments/${invalidArticleId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response).to.have.status(404);
      });
      it("should return 400 if invalid data is provided", async () => {
        const response = await request(server)
          .patch(`/api/articles/comments/${validCommentId}`)
          .send({
            comment: 2.1,
          })
          .set("Authorization", `Bearer ${token}`);

        expect(response).to.have.status(400);
      });
      it("should return 200 if valid comment id and token are provided", async () => {
        const response = await request(server)
          .patch(`/api/articles/comments/${validCommentId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            comment: faker.company.catchPhrase(),
          })
          .set("Authorization", `Bearer ${token}`);

        expect(response).to.have.status(200);
        expect(response.body).to.have.property("comment");
      });
    });
    describe("DELETE /api/articles/comments/:id", () => {
      it("should return 401 if token  is not provided", async () => {
        const response = await request(server).delete(
          `/api/articles/comments/${validCommentId}`
        );
        expect(response).to.have.status(401);
      });
      it("should return 404 if invalidId is provided", async () => {
        const response = await request(server)
          .delete(`/api/articles/comments/${invalidArticleId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response).to.have.status(404);
      });
      it("should return 200 if valid  id and token are provided", async () => {
        const response = await request(server)
          .delete(`/api/articles/comments/${validCommentId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response).to.have.status(200);
      });
    });
  });
  describe("DELETE /api/articles/:id", () => {
    it("should return 401 if token  is not provided", async () => {
      const response = await request(server).delete(
        `/api/articles/${validArticleId}`
      );
      expect(response).to.have.status(401);
    });
    it("should return 403 if non admin token  provided", async () => {
      const response = await request(server)
        .delete(`/api/articles/${validArticleId}`)
        .set("Authorization", `Bearer ${guestToken}`);

      expect(response).to.have.status(403);
    });
    it("should return 404 if invalid id is provided", async () => {
      const response = await request(server)
        .delete(`/api/articles/${invalidArticleId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response).to.have.status(404);
    });
    it("should return 200 if valid  id and token are provided", async () => {
      const response = await request(server)
        .delete(`/api/articles/${validArticleId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response).to.have.status(200);
    });
  });
});

