import chaiHttp from "chai-http";
import chai, { expect } from "chai";
import { join as joinPath } from "path";
import { existsSync } from "fs";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { describe, it, after, before } from "mocha";

import server from "../..";
import { createBanner } from "../../helpers/bannerCreator";
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
    expect(existsSync(testingImageFolder)).to.be.false;
  });
  describe("/", () => {
    it("should return 404", async () => {
      const res = await request(server).get("/");
      expect(res).to.have.status(404);
    });
  });
  describe("Base /api", function () {
    let token;
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
      expect(token).to.be.a("string");
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
    describe("/api/auth", () => {
      let userToken;
      const password = faker.internet.password();
      const user = {
        name: faker.name.findName(),
        username: faker.internet.userName(),
        password,
        email: faker.internet.email(),
        confirmPassword: password,
      };
      describe("POST api/auth/signup", async () => {
        it("should return 400, if invalidData is not given", async () => {
          let response;
          response = await request(server).post("/api/auth/signup");
          expect(response).to.have.status(400);

          response = await request(server).post("/api/auth/signup").send();
          expect(response).to.have.status(400);

          expect(response).to.have.status(400);
        });
        it("should return 201 status and user created, if valid credentials provided", async () => {
          let response;
          let password = faker.internet.password();
          response = await request(server).post("/api/auth/signup").send(user);
          expect(response).to.have.status(201);
          expect(response.body).to.have.property("user");
        });
      });
      describe("POST api/auth/login", () => {
        it("should return 400, if invalid data is not given", async () => {
          let response;
          response = await request(server).post("/api/auth/login");
          expect(response).to.have.status(400);
        });
        it("should return 401, if user doesn't exits  is not valid ", async () => {
          let response;
          response = await request(server).post("/api/auth/login").send({
            email: faker.internet.email(),
            password: faker.internet.password(),
          });
          expect(response).to.have.status(401);
        });
        it("should return 401, if user password is invalid", async () => {
          let response = await request(server)
            .post("/api/auth/login")
            .send({ email: user.email, password: "1" });
          expect(response).to.have.status(401);
        });
        it("should return 200 and token, if credentials are valid", async () => {
          let response = await request(server)
            .post("/api/auth/login")
            .send({ email: user.email, password });
          expect(response).to.have.status(200);
          expect(response.body).to.have.property("token");
          userToken = response.body.token;
        });
      });
      describe("GET api/auth/signout", () => {
        it("should return 308, if user is not logged in", async () => {
          let response = await request(server).patch("/api/auth/signout");
          expect(response).to.have.status(401);
        });
        it("should return 200", async () => {
          let response = await request(server)
            .patch("/api/auth/signout")
            .set("Authorization", `Bearer ${userToken}`);
          expect(response).to.have.status(200);
        });
      });
    });
    describe("/api/messages", () => {
      let validId;
      let invalidId;

      before(async () => {
        const response = await request(server).post("/api/messages").send({
          name: faker.name.findName(),
          subject: faker.company.catchPhrase(),
          email: faker.internet.email(),
          message: faker.lorem.paragraph(),
        });
        validId = response.body?.message?._id;
        invalidId = faker.random.alphaNumeric(16);
      });
      describe("GET /api/messages", () => {
        it("should return 401 if token not provided", async () => {
          const response = await request(server).get("/api/messages");
          expect(response).to.have.status(401);
        });
        it("should return 200  and message sif token  provided and messages", async () => {
          const response = await request(server)
            .get("/api/messages")
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(200);
          expect(response.body).to.have.property("messages");
        });
      });

      describe("POST /api/messages", () => {
        it("should return 400 if invalid data is  provided", async () => {
          const response = await request(server).post("/api/messages");
          expect(response).to.have.status(400);
        });
        it("should return 201 status and created message if valid token and data provided", async () => {
          const response = await request(server).post("/api/messages").send({
            name: faker.name.findName(),
            subject: faker.company.catchPhrase(),
            email: faker.internet.email(),
            message: faker.lorem.paragraph(),
          });
          expect(response).to.have.status(201);
          expect(response.body).to.have.property("message");
        });
      });
      describe("PATCH /api/messages/:id", () => {
        it("should return 401 if token  is not given", async () => {
          const response = await request(server).patch(
            `/api/messages/${validId}`
          );
          expect(response).to.have.status(401);
        });
        it("should return 400 if invalid data is given", async () => {
          const response = await request(server)
            .patch(`/api/messages/${validId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
              read: 12.3,
            })
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(400);
        });
        it("should return 404 if  message id is not found", async () => {
          const response = await request(server)
            .patch(`/api/messages/${invalidId}`)
            .send({
              read: true,
              reply: faker.lorem.lines(2),
            })
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(404);
        });
        it("should return 200  and message if token  provided and messages", async () => {
          const response = await request(server)
            .patch(`/api/messages/${validId}`)
            .send({
              read: true,
              reply: "Warm welcome",
            })
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(200);
          expect(response.body).to.have.property("message");
        });
      });
      describe("GET /api/messages/:id", () => {
        it("should return 401 if token  is not given", async () => {
          const response = await request(server).get(
            `/api/messages/${validId}`
          );
          expect(response).to.have.status(401);
        });
        it("should return 404 if invalid id is given", async () => {
          const response = await request(server)
            .get(`/api/messages/${invalidId}`)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(404);
        });
        it("should return 200 with message if valid  id and token are provided", async () => {
          const response = await request(server)
            .get(`/api/messages/${validId}`)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(200);
          expect(response.body).to.have.property("message");
        });
      });
      describe("DELETE /api/messages/:id", () => {
        it("should return 401 if token  is not given", async () => {
          const response = await request(server).delete(
            `/api/messages/${validId}`
          );
          expect(response).to.have.status(401);
        });
        it("should return 404 if invalid id is given", async () => {
          const response = await request(server)
            .delete(`/api/messages/${invalidId}`)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(404);
        });
        it("should return 200 if valid  id and token are provided", async () => {
          const response = await request(server)
            .delete(`/api/messages/${validId}`)
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(200);
        });
      });
    });
    describe("/api/articles", function () {
      let validArticleId;
      let invalidArticleId;
      let validCategoryId;
      this.timeout(30000);
      before(async () => {
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
      });
      describe("GET /api/articles/", () => {
        it("should return 401 if token is not provided", async () => {
          const response = await request(server).get("/api/articles");
          expect(response).to.have.status(401);
        });
        it("should return 200  and articles if valid token  is provided", async () => {
          const response = await request(server)
            .get("/api/articles")
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(200);
          expect(response.body).to.have.property("articles");
        });
      });

      describe("POST /api/articles/", () => {
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
            .post("/api/articles")
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
          const image = await createBanner("test", { inputPath: inputPath });
          const response = await request(server)
            .post("/api/articles")
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
      describe("PATCH /api/articles/:id", () => {
        it("should return 401 if token  is not given", async () => {
          const response = await request(server).patch(
            `/api/articles/${validArticleId}`
          );
          expect(response).to.have.status(401);
        });
        it("should return 400 if invalid data is given", async () => {
          const response = await request(server)
            .patch(`/api/articles/${validArticleId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
              featured: 12.3,
            })
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(400);
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
        it("should return 401 if token  is not given", async () => {
          const response = await request(server).get(
            `/api/articles/${validArticleId}`
          );
          expect(response).to.have.status(401);
        });
        it("should return 404 if invalid id is given", async () => {
          const response = await request(server)
            .get("/api/articles/" + invalidArticleId)
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
          it("should return 401 if token  is not given", async () => {
            const response = await request(server)
              .post(`/api/articles/${validArticleId}` + "/comment")
              .send({
                content: "test",
              });
            expect(response).to.have.status(401);
          });
          it("should return 400 if invalid data is given", async () => {
            const response = await request(server)
              .post(`/api/articles/${validArticleId}` + "/comment")
              .set("Authorization", `Bearer ${token}`)
              .send({});
            expect(response).to.have.status(400);
          });
          it("should return 404 if articleId is given", async () => {
            const response = await request(server)
              .post("/api/articles/" + invalidArticleId + "/comment")
              .set("Authorization", `Bearer ${token}`)
              .send({ comment: faker.company.catchPhrase() });
            expect(response).to.have.status(404);
          });
          it("should return 201 if valid data is given", async () => {
            const response = await request(server)
              .post(`/api/articles/${validArticleId}` + "/comment")
              .set("Authorization", `Bearer ${token}`)
              .send({
                comment: faker.company.catchPhrase(),
              });
            expect(response).to.have.status(201);
          });
        });
      });

      describe("/api/articles/category", () => {
        describe("GET /api/articles/", () => {
          it("should return 401 if token  is not given", async () => {
            const response = await request(server).get(
              "/api/articles/categories"
            );
            expect(response).to.have.status(401);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            const response = await request(server)
              .get("/api/articles/categories")
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("categories");
          });
        });
        describe("GET /api/articles/categories/:id", () => {
          it("should return 401 if token  is not given", async () => {
            const response = await request(server).get(
              `/api/articles/categories/${validCategoryId}`
            );
            expect(response).to.have.status(401);
          });
          it("should return 400 if invalidId given", async () => {
            const response = await request(server).get(
              "/api/articles/categories/test"
            );
            expect(response).to.have.status(401);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .get(`/api/articles/categories/${validCategoryId}`)
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("category");
            response = await request(server)
              .get(
                `/api/articles/categories/${validCategoryId}?categories=true`
              )
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("category");
          });
        });
        describe("PATCH /api/articles/:category", () => {
          it("should return 401 if token  is not given", async () => {
            const response = await request(server).patch(
              `/api/articles/categories/${validCategoryId}`
            );
            expect(response).to.have.status(401);
          });
          it("should return 404 if invalidId given", async () => {
            const response = await request(server)
              .patch(`"/api/articles/categories/${invalidArticleId}`)
              .send({
                description: "Welcome",
                title: "welcome",
              })
              .set("Authorization", `Bearer ${token}`);

            expect(response).to.have.status(404);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            const response = await request(server)
              .patch(`/api/artices/categories/${validCategoryId}`)

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
            .post(`/api/articles/${validArticleId}` + "/comment")
            .set("Authorization", `Bearer ${token}`)
            .send({
              comment: faker.company.catchPhrase(),
            });
          validCommentId = response?.body?.comment?._id;
        });
        describe("GET /api/articles/comments/", () => {
          it("should return 401 if token  is not given", async () => {
            const response = await request(server).get(
              "/api/articles/comments/"
            );
            expect(response).to.have.status(401);
          });

          it("should return 200 and comments if valid  id and token are provided", async () => {
            const response = await request(server)
              .get("/api/articles/comments/")
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("comments");
          });
        });
        describe("GET /api/articles/comments/:id", () => {
          it("should return 401 if token  is not given", async () => {
            const response = await request(server).get(
              `/api/articles/comments/${validCommentId}`
            );
            expect(response).to.have.status(401);
          });
          it("should return 404 if token  invalid id is given", async () => {
            const response = await request(server)
              .get("/api/articles/comments/" + invalidArticleId)
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
        describe("UPDATE /api/articles/comments/:id", () => {
          it("should return 401 if token  is not given", async () => {
            const response = await request(server).patch(
              `/api/articles/comments/${validCommentId}`
            );
            expect(response).to.have.status(401);
          });
          it("should return 404 if comment id is invalid", async () => {
            const response = await request(server)
              .patch("/api/articles/comments/" + invalidArticleId)
              .set("Authorization", `Bearer ${token}`);

            expect(response).to.have.status(404);
          });
          it("should return 400 if invalid data is given", async () => {
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
          it("should return 401 if token  is not given", async () => {
            const response = await request(server).delete(
              `/api/articles/comments/${validCommentId}`
            );
            expect(response).to.have.status(401);
          });
          it("should return 404 if invalidId is provided", async () => {
            const response = await request(server)
              .delete("/api/articles/comments/" + invalidArticleId)
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
        it("should return 401 if token  is not given", async () => {
          const response = await request(server).delete(
            `/api/articles/${validArticleId}`
          );
          expect(response).to.have.status(401);
        });
        it("should return 404 if invalid id is given", async () => {
          const response = await request(server)
            .delete("/api/articles/" + invalidArticleId)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(404);
        });
        it("should return 200 if valid  id and token are provided", async () => {
          let response = await request(server)
            .delete(`/api/articles/${validArticleId}`)
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(200);
        });
      });
    });
    describe("/api/project", function () {
      let validProjectId;
      let invalidProjectId;
      let validCategoryId;
      this.timeout(30000);
      before(async () => {
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
      describe("GET /", () => {
        it("should return 401 if token is not provided", async () => {
          let response = await request(server).get("/api/articles");
          expect(response).to.have.status(401);
        });
        it("should return 200  and articles if valid token  is provided", async () => {
          let response = await request(server)
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

      describe("/api/user", function () {
        describe("GET /api/user/profile", async () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).get("/api/user/profile");
            expect(response).to.have.status(401);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .get("/api/user/profile")
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("user");
          });
        });
        describe("PATCH /api/user/profile", async () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).patch("/api/user/profile");
            expect(response).to.have.status(401);
          });
          it.skip("should return 200 if valid  id and token are provided", async () => {
            const response = await request(server)
              .patch("/api/user/profile")
              .set("Authorization", `Bearer ${token}`)
              .send({
                user: {
                  summary: faker.company.catchPhrase(),
                  info: faker.lorem.lines(2),
                  keywords: faker.fake("{{random.word}}, {{random.word}}"),
                },
              });
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("user");
          });
        });
        describe("DELETE /api/user/profile", async () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).delete("/api/user/profile");
            expect(response).to.have.status(401);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .delete("/api/user/profile")
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
          });
        });
      });
    });
  });
});
