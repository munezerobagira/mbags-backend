import { expect } from "chai";
import truncateDb from "../../truncateDb";

describe("emptyDB", () => {
  it("should delete all data", async () => {
    const status = await truncateDb();
    expect(status).to.equal(true);
  });
});

