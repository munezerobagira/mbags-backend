import { JsonWebTokenError } from "jsonwebtoken";
import { Error } from "mongoose";
import { INTERNAL_SERVER_ERROR, TOKEN_ERROR } from "./Constants";

const mongoDuplicateErrorMessage = (stack) => {
  let error = stack.split("index")[1]?.trim();
  error = error
    .replace(/[{}:_"]|dup\s+key/g, "")
    .trim()
    .replace(/\s+/, " ");
  error = `${error} already exists`;
  return error;
};
/**
 *
 * @param {*} error
 * @
 */
const errorFormatter = (error) => {
  if (error.constructor) {
    const { stack } = error;
    switch (error.constructor) {
      case ReferenceError:
      case TypeError:
      case SyntaxError:
        return {
          status: 500,
          message: INTERNAL_SERVER_ERROR,
          error: {
            stack,
          },
        };
      default:
        if (error instanceof Error.CastError || Error.name === "CastError") {
          return {
            status: 404,
            message: "Invalid id",
            error: {
              stack,
            },
          };
        }

        if (error.name === "MongoServerError" && error.code === 11000)
          return {
            status: 400,
            message: mongoDuplicateErrorMessage(error.message),
            error: {
              stack,
            },
          };
        if (error instanceof JsonWebTokenError) {
          return {
            status: 401,
            message: TOKEN_ERROR,
            error: {
              stack,
            },
          };
        }
        return {
          status: 500,
          message: error.name,
          error: {
            stack,
          },
        };
    }
  } else {
    return {
      status: 500,
      message: "Ask admin to check the error",
      stack: "You designed the systems so check this error",
    };
  }
};
export default errorFormatter;
