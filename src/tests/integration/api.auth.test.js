import chaiHttp from "chai-http";
import chai, { expect } from "chai";
import { faker } from "@faker-js/faker";
import server from "../..";

chai.use(chaiHttp);
const { request } = chai;

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
    it("should return 400 with an errors, if invalidData is not given", async () => {
      const response = await request(server).post("/api/auth/signup");
      expect(response).to.have.status(400);
      expect(response.body).to.have.property("errors");
    });
    it("should return 201 status and user created, if valid credentials provided", async () => {
      const response = await request(server)
        .post("/api/auth/signup")
        .send(user);
      expect(response).to.have.status(201);
      expect(response.body).to.have.property("user");
    });
  });
  describe("POST api/auth/login", () => {
    it("should return 400 and errors, if invalid data is not given", async () => {
      const response = await request(server).post("/api/auth/login");
      expect(response).to.have.status(400);
      expect(response.body).to.have.property("errors");
    });
    it("should return 400, if user doesn't exits", async () => {
      const response = await request(server).post("/api/auth/login").send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      expect(response).to.have.status(400);
    });
    it("should return 400 with error, if user credential is invalid", async () => {
      const response = await request(server)
        .post("/api/auth/login")
        .send({ email: user.email, password: "1" });
      expect(response).to.have.status(400);
      expect(response.body).to.have.property("error");
    });
    it("should return 200 and token, if credentials are valid", async () => {
      const response = await request(server)
        .post("/api/auth/login")
        .send({ email: user.email, password });
      expect(response).to.have.status(200);
      expect(response.body).to.have.property("token");
      userToken = response.body.token;
    });
  });
  describe("GET api/auth/signout", () => {
    it("should return 401, if user is not logged in", async () => {
      const response = await request(server).patch("/api/auth/signout");
      expect(response).to.have.status(401);
    });
    it("should return 200", async () => {
      const response = await request(server)
        .patch("/api/auth/signout")
        .set("Authorization", `Bearer ${userToken}`);
      expect(response).to.have.status(200);
    });
  });
});
