import chaiHttp from "chai-http";
import chai, { expect } from "chai";
const { faker } = require("@faker-js/faker");
chai.use(chaiHttp);
const request = chai.request;
import server from "../../";
import mongoose from "mongoose";
import { response } from "express";
describe("API test", () => {
  before(async () => {
    // Make sure we're connected to the db
    await mongoose.connection.asPromise();
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
        it("should return 201 status and user created, if valid data is not given", async () => {
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
        invalidId = faker.internet.password(12);
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
        it("should return 201 status and created message1 if token  provided and messages", async () => {
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
        it("should return 400 if  id is not found", async () => {
          let response = await request(server)
            .patch("/api/messages/" + invalidId)
            .send({
              read: "something",
              reply: 1,
            })
            .set("Authorization", `Bearer ${token}`);
          expect(response).to.have.status(400);
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
  });
});
