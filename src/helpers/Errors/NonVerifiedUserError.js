export default class NonVerifiedUserError extends Error {
  constructor() {
    super("User Account need verification");
  }
}
