import errorFormatter from "../helpers/errorFormatter";
import { verifyAuthToken } from "../helpers/jwt";
import Logger from "../helpers/Logger";

export const isLoggedIn = async (request, response, next) => {
  try {
    const token =
      request.headers &&
      request.headers.authorization &&
      request.headers.authorization.split(" ")[1];

    const user = await verifyAuthToken(token);
    request.user = user;
    request.token = token;
    request.userRole = user.role;
    return next();
  } catch (error) {
    const formattedError = errorFormatter(error);
    Logger.info(
      `${new Date().toLocaleString()} - ${request.ip} - ${
        formattedError.message
      }`
    );
    return response
      .status(formattedError.status)
      .json({ status: formattedError.status, error: formattedError.message });
  }
};
export const checkRole = (role) => async (request, response, next) => {
  try {
    const { userRole } = request;
    if (userRole === role) return next();
    return response.status(403).json({
      status: 403,
      error: "Resource access denied",
    });
  } catch (error) {
    return response.status(401).json({
      status: 401,
      error: "You must login first",
    });
  }
};
