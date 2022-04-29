/* eslint-disable func-names */
import chaiHttp from "chai-http";
import chai, { expect } from "chai";
import { faker } from "@faker-js/faker";
import { createUser } from "../../models/User";
import server from "../..";

chai.use(chaiHttp);
const { request } = chai;

describe("/api/messages", () => {
  let validId;
  let invalidId;
  let token;
  let guestToken;
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
    it.skip("should return 403 if non admin token is provided", async () => {
      const response = await request(server)
        .get("/api/messages")
        .set("Authorization", `Bearer ${guestToken}`);
      expect(response).to.have.status(403);
    });
    it("should return 200  and message if  valid token  provided and messages", async () => {
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
      const response = await request(server).patch(`/api/messages/${validId}`);
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
    it.skip("should return 403 if non admin token is provided", async () => {
      const response = await request(server)
        .patch(`/api/messages/${validId}`)
        .set("Authorization", `Bearer ${guestToken}`);
      expect(response).to.have.status(403);
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
      const response = await request(server).get(`/api/messages/${validId}`);
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
      const response = await request(server).delete(`/api/messages/${validId}`);
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
