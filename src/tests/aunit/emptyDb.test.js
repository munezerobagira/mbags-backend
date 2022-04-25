import emptypDb from "../../emptyDb";
describe("emptyDB", () => {
  it("should delete all data", async () => {
    await emptypDb();
  });
});
