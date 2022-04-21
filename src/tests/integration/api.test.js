import chaiHttp from "chai-http";
import chai, { expect } from "chai";
const { faker } = require("@faker-js/faker");
import server from "../../";
import mongoose from "mongoose";
import { createBanner } from "../../helpers/bannerCreator";
import {
  createImageTestingFolder,
  deleteImageTestingFolder,
} from "../../testFunctions";
import { join as joinPath } from "path";
import { existsSync } from "fs";
chai.use(chaiHttp);
const request = chai.request;

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
  describe("Base /api", () => {
    let user;
    let token;

    before(async () => {
      let password = faker.internet.password();
      user = {
        name: faker.name.firstName() + " " + faker.name.lastName(),
        username: faker.internet.userName(),
        password,
        email: faker.internet.email(),
        confirmPassword: password,
      };
      await request(server).post("/api/auth/signup").send(user);
      token = await (
        await request(server).post("/api/auth/login").send(user)
      ).body.token;
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
    describe("/auth", () => {
      describe("POST /signup", async () => {
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
          response = await request(server)
            .post("/api/auth/signup")
            .send({
              name: faker.name.firstName() + " " + faker.name.lastName(),
              username: faker.internet.userName(),
              password,
              email: faker.internet.email(),
              confirmPassword: password,
            });
          expect(response).to.have.status(201);
          expect(response.body).to.have.property("user");
        });
      });
      describe("POST /login", () => {
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
            .send(user);
          expect(response).to.have.status(200);
          expect(response.body).to.have.property("token");
        });
      });
    });
    describe("/messages", () => {
      let validId;
      let invalidId;

      before(async () => {
        let response = await request(server).post("/api/messages").send({
          name: faker.name.findName(),
          subject: faker.company.catchPhrase(),
          email: faker.internet.email(),
          message: faker.lorem.paragraph(),
        });
        validId = response.body?.message?._id;
        invalidId = faker.random.alphaNumeric(16);
      });
      describe("GET /", () => {
        it("should return 401 if token not provided", async () => {
          let response = await request(server).get("/api/messages");
          expect(response).to.have.status(401);
        });
        it("should return 200  and message sif token  provided and messages", async () => {
          let response = await request(server)
            .get("/api/messages")
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(200);
          expect(response.body).to.have.property("messages");
        });
      });

      describe("POST /", () => {
        it("should return 400 if invalid data is  provided", async () => {
          let response = await request(server).post("/api/messages");
          expect(response).to.have.status(400);
        });
        it("should return 201 status and created message if valid token and data provided", async () => {
          let response = await request(server).post("/api/messages").send({
            name: faker.name.findName(),
            subject: faker.company.catchPhrase(),
            email: faker.internet.email(),
            message: faker.lorem.paragraph(),
          });
          expect(response).to.have.status(201);
          expect(response.body).to.have.property("message");
        });
      });
      describe("PATCH /:id", () => {
        it("should return 401 if token  is not given", async () => {
          let response = await request(server).patch(
            "/api/messages/" + validId
          );
          expect(response).to.have.status(401);
        });
        it("should return 400 if invalid data is given", async () => {
          let response = await request(server)
            .patch("/api/messages/" + validId)
            .set("Authorization", `Bearer ${token}`)
            .send({
              read: 12.3,
            })
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(400);
        });
        it("should return 404 if  message id is not found", async () => {
          let response = await request(server)
            .patch("/api/messages/" + invalidId)
            .send({
              read: true,
              reply: faker.lorem.lines(2),
            })
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(404);
        });
        it("should return 200  and message if token  provided and messages", async () => {
          let response = await request(server)
            .patch("/api/messages/" + validId)
            .send({
              read: true,
              reply: "Warm welcome",
            })
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(200);
          expect(response.body).to.have.property("message");
        });
      });
      describe("GET /:id", () => {
        it("should return 401 if token  is not given", async () => {
          let response = await request(server).get("/api/messages/" + validId);
          expect(response).to.have.status(401);
        });
        it("should return 404 if invalid id is given", async () => {
          let response = await request(server)
            .get("/api/messages/" + invalidId)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(404);
        });
        it("should return 200 with message if valid  id and token are provided", async () => {
          let response = await request(server)
            .get("/api/messages/" + validId)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(200);
          expect(response.body).to.have.property("message");
        });
      });
      describe("DELETE /:id", () => {
        it("should return 401 if token  is not given", async () => {
          let response = await request(server).delete(
            "/api/messages/" + validId
          );
          expect(response).to.have.status(401);
        });
        it("should return 404 if invalid id is given", async () => {
          let response = await request(server)
            .delete("/api/messages/" + invalidId)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(404);
        });
        it("should return 200 if valid  id and token are provided", async () => {
          let response = await request(server)
            .delete("/api/messages/" + validId)
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(200);
        });
      });
    });
    describe("/articles", function () {
      let validArticleId;
      let invalidArticleId;
      let validCategoryId;
      this.timeout(30000);
      before(async () => {
        let inputPath = joinPath(
          testingImageFolder,
          faker.random.alphaNumeric(12)
        );
        let image = await createBanner("test", { inputPath: inputPath });
        let response = await request(server)
          .post("/api/articles")
          .field("title", faker.company.catchPhrase())
          .field("summary", faker.company.catchPhraseDescriptor())
          .field("content", faker.lorem.paragraphs(3))
          .field("categories", faker.fake("{{random.word}}, {{random.word}}"))
          .attach("image", image, "test.png")
          .set("Authorization", `Bearer ${token}`);

        validArticleId = response.body?.article?._id;
        invalidArticleId = faker.random.alphaNumeric(16);
        validCategoryId = response.body?.article?.categories[0];
      });
      describe("GET /", () => {
        it("should return 401 if token is not provided", async () => {
          let response = await request(server).get("/api/articles");
          expect(response).to.have.status(401);
        });
        it("should return 200  and articles if valid token  is provided", async () => {
          let response = await request(server)
            .get("/api/articles")
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(200);
          expect(response.body).to.have.property("articles");
        });
      });

      describe("POST /", () => {
        it("should return 401 if token  is not given", async () => {
          let response = await request(server).post("/api/articles/");
          expect(response).to.have.status(401);
        });
        it("should return 400 if invalid data is  provided", async () => {
          let response = await request(server)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(400);
        });
        it("should return 201 created if image is not provided", async () => {
          let response = await request(server)
            .post("/api/articles")
            .field("title", faker.company.catchPhrase())
            .field("summary", faker.company.catchPhraseDescriptor())
            .field("content", faker.lorem.paragraphs(3))
            .field("categories", faker.fake("{{random.word}}, {{random.word}}"))
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(201);
        });
        it("should return 201 status and created article if token  provided and messages", async () => {
          let inputPath = joinPath(
            testingImageFolder,
            faker.random.alphaNumeric(12)
          );
          let image = await createBanner("test", { inputPath: inputPath });
          let response = await request(server)
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
      describe("PATCH /:id", () => {
        it("should return 401 if token  is not given", async () => {
          let response = await request(server).patch(
            "/api/articles/" + validArticleId
          );
          expect(response).to.have.status(401);
        });
        it("should return 400 if invalid data is given", async () => {
          let response = await request(server)
            .patch("/api/articles/" + validArticleId)
            .set("Authorization", `Bearer ${token}`)
            .send({
              featured: 12.3,
            })
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(400);
        });
        it("should return 404 if  articleId is invalid", async () => {
          let response = await request(server)
            .patch("/api/articles/" + invalidArticleId)
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
          let response = await request(server)
            .patch("/api/articles/" + validArticleId)
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
      describe("GET /:id", () => {
        it("should return 401 if token  is not given", async () => {
          let response = await request(server).get(
            "/api/articles/" + validArticleId
          );
          expect(response).to.have.status(401);
        });
        it("should return 404 if invalid id is given", async () => {
          let response = await request(server)
            .get("/api/articles/" + invalidArticleId)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(404);
        });
        it("should return 200 with message if valid  id and token are provided", async () => {
          let response = await request(server)
            .get("/api/articles/" + validArticleId)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(200);
          expect(response.body).to.have.property("article");
        });
      });

      describe("/:articleId", () => {
        describe("POST /comment", async () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server)
              .post("/api/articles/" + validArticleId + "/comment")
              .send({
                content: "test",
              });
            expect(response).to.have.status(401);
          });
          it("should return 400 if invalid data is given", async () => {
            let response = await request(server)
              .post("/api/articles/" + validArticleId + "/comment")
              .set("Authorization", `Bearer ${token}`)
              .send({});
            expect(response).to.have.status(400);
          });
          it("should return 404 if articleId is given", async () => {
            let response = await request(server)
              .post("/api/articles/" + invalidArticleId + "/comment")
              .set("Authorization", `Bearer ${token}`)
              .send({ comment: faker.company.catchPhrase() });
            expect(response).to.have.status(404);
          });
          it("should return 201 if valid data is given", async () => {
            let response = await request(server)
              .post("/api/articles/" + validArticleId + "/comment")
              .set("Authorization", `Bearer ${token}`)
              .send({
                comment: faker.company.catchPhrase(),
              });
            expect(response).to.have.status(201);
          });
        });
      });

      describe("/category", () => {
        describe("GET /", () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).get(
              "/api/articles/categories"
            );
            expect(response).to.have.status(401);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .get("/api/articles/categories")
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("categories");
          });
        });
        describe("GET /:category", () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).get(
              "/api/articles/categories/" + validCategoryId
            );
            expect(response).to.have.status(401);
          });
          it("should return 400 if invalidId given", async () => {
            let response = await request(server).get(
              "/api/articles/categories/test"
            );
            expect(response).to.have.status(401);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .get("/api/articles/categories/" + validCategoryId)
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("category");
          });
        });
        describe("PATCH /:category", () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).patch(
              "/api/articles/categories/" + validCategoryId
            );
            expect(response).to.have.status(401);
          });
          it("should return 400 if invalidId given", async () => {
            let response = await request(server)
              .patch("/api/articles/categories/" + invalidArticleId)
              .send({
                description: "Welcoem",
                title: "welcome",
              });
            expect(response).to.have.status(401);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .patch("/api/articles/categories/" + validCategoryId)
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
      describe.skip("/comments", () => {
        let validCommentId;
        before(async () => {
          let response = await request(server)
            .post("/api/articles/" + validArticleId + "/comment")
            .set("Authorization", `Bearer ${token}`)
            .send({
              comment: faker.company.catchPhrase(),
            });
          validCommentId = response?.body?.comment?._id;
        });
        describe("GET /", () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).get("/api/articles/comments/");
            expect(response).to.have.status(401);
          });

          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .get("/api/articles/comments/")
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("comments");
          });
        });
        describe("GET /:id", () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).get(
              "/api/articles/comments/" + validCommentId
            );
            expect(response).to.have.status(401);
          });
          it("should return 404 if token  is not given", async () => {
            let response = await request(server).get(
              "/api/articles/comments/" + invalidArticleId
            );
            expect(response).to.have.status(404);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .get("/api/articles/comments/" + validCommentId)
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("comment");
          });
        });
        describe("UPDATE /:id", () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).patch(
              "/api/articles/comments/" + validCommentId
            );
            expect(response).to.have.status(401);
          });
          it("should return 404 if invalidId is given", async () => {
            let response = await request(server).patch(
              "/api/articles/comments/" + invalidArticleId
            );
            expect(response).to.have.status(404);
          });
          it("should return 400 if invalid data is given", async () => {
            let response = await request(server)
              .patch("/api/articles/comments/" + validCommentId)
              .send({
                comment: 2.1,
              });
            expect(response).to.have.status(400);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .put("/api/articles/comments/" + validCommentId)
              .set("Authorization", `Bearer ${token}`)
              .send({
                comment: faker.company.catchPhrase(),
              });
            expect(response).to.have.status(200);
            expect(response.body).to.have.property("comment");
          });
        });
        describe("DELETE /:id", () => {
          it("should return 401 if token  is not given", async () => {
            let response = await request(server).delete(
              "/api/articles/comments/" + validCommentId
            );
            expect(response).to.have.status(401);
          });
          it("should return 404 if invalidId is provided", async () => {
            let response = await request(server).delete(
              "/api/articles/comments/" + invalidArticleId
            );
            expect(response).to.have.status(404);
          });
          it("should return 200 if valid  id and token are provided", async () => {
            let response = await request(server)
              .delete("/api/articles/comments/" + validCommentId)
              .set("Authorization", `Bearer ${token}`);
            expect(response).to.have.status(200);
          });
        });
      });
      describe("DELETE /:id", () => {
        it("should return 401 if token  is not given", async () => {
          let response = await request(server).delete(
            "/api/articles/" + validArticleId
          );
          expect(response).to.have.status(401);
        });
        it("should return 404 if invalid id is given", async () => {
          let response = await request(server)
            .delete("/api/articles/" + invalidArticleId)
            .set("Authorization", `Bearer ${token}`);

          expect(response).to.have.status(404);
        });
        it("should return 200 if valid  id and token are provided", async () => {
          let response = await request(server)
            .delete("/api/articles/" + validArticleId)
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(200);
        });
      });
    });
  });
});
