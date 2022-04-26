import { ValidationError } from "joi";
import { JsonWebTokenError } from "jsonwebtoken";
import {} from "mongoose";
import {
  INTERNAL_SERVER_ERROR,
  TOKEN_ERROR,
  UNSUPPORTED_IMAGE_FORMAT,
} from "./Constants";

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
        if (error instanceof ValidationError) {
          return {
            status: 400,
            message: error.message,
            error: {
              stack,
            },
          };
        }
        if (error instanceof JsonWebTokenError) {
          return {
            status: 401,
            message: TOKEN_ERROR,
            error: {
              stack,
            },
          };
        }
        if (error.stack.includes("Invalid input\n    at Sharp"))
          return {
            status: 400,
            message: UNSUPPORTED_IMAGE_FORMAT,
            error: {
              stack,
            },
          };
        if (
          error.stack.includes("Input buffer contains unsupported image format")
        )
          return {
            status: 400,
            message: UNSUPPORTED_IMAGE_FORMAT,
            error: {
              stack,
            },
          };
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
