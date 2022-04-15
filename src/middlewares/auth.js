import { verifyAuthToken } from "../helpers/jwt";
export const isLoggedIn = async (request, response, next) => {
  try {
    const token =
      request.headers &&
      request.headers.authorization &&
      request.headers.authorization.split(" ")[1];

    const user = await verifyAuthToken(token);
    request.user = user;
    request.token = token;
    next();
  } catch (error) {
    return response.status(401).json({
      error: "You must login first",
    });
  }
};
