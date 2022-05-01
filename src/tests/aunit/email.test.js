/* eslint-disable no-unused-expressions */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { verificationEmail } from "../../config";
import {
  sendEmail,
  generateVerifyTemplate,
  generatePasswordResetTemplate,
  generateReplyMessageTemplate,
} from "../../helpers/email";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("email", function () {
  this.timeout(10000);
  describe("verify mail template", () => {
    it("should throw an error if invalid email, name, token is provided", () => {
      expect(generateVerifyTemplate).to.throw(Error);
    });
    it("should reuturn the valid template", () => {
      const template = generateVerifyTemplate({
        name: "user",
        email: "user@gmail.com",
        token: "token",
      });
      expect(template).to.have.property("subject", "Verify your email");
      expect(template).to.have.property("html");
      expect(template).to.have.property("to", "user@gmail.com");
      expect(template).to.have.property("from", verificationEmail);
    });
  });
  describe("reply message email template", () => {
    it("should throw an error if invalid email, name, token is provided", () => {
      expect(generateReplyMessageTemplate).to.throw(Error);
    });
    it("should return the valid template", () => {
      const template = generateReplyMessageTemplate({
        name: "user",
        email: "user@gmail.com",
        message: "reply message",
      });
      expect(template).to.have.property("subject", "Message reply");
      expect(template).to.have.property("html");
      expect(template).to.have.property("to", "user@gmail.com");
      expect(template).to.have.property("from", verificationEmail);
    });
  });
  describe("password reset email template", () => {
    it("should throw an error if invalid token is provided", () => {
      expect(generatePasswordResetTemplate).to.throw(Error);
    });
    it("should return the valid template", () => {
      const template = generatePasswordResetTemplate({
        name: "user",
        email: "user@gmail.com",
        token: "reply message",
      });
      expect(template).to.have.property("subject", "Password reset");
      expect(template).to.have.property("html");
      expect(template).to.have.property("to", "user@gmail.com");
      expect(template).to.have.property("from", verificationEmail);
    });
  });
  it.skip("should send email", async () => {
    const template = generateVerifyTemplate({
      email: "bagira.sostenee@gmail.com",
      name: "Bagira",
      token: "token",
    });
    expect(sendEmail(template)).to.be.eventually.fulfilled;
  });
});
