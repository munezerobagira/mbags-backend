import { expect } from "chai";
import errorFormatter from "../../helpers/errorFormatter";
import { referenceError } from "./helpers/error";

describe("errorFormatter", () => {
  it("it should return status 500", () => {
    const error = referenceError();
    const formattedError = errorFormatter(error);
    expect(formattedError).have.status(500);
  });
});
