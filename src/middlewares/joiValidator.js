import errorFormatter from "../helpers/errorFormatter";
import Logger from "../helpers/Logger";

/* eslint-disable func-names */
export default function joiValidator(schema, path = "body") {
  return async function (request, response, next) {
    try {
      const { value, error } = await schema.validate(request[path], {
        abortEarly: false,
      });
      if (error)
        return response.status(400).json({
          errors: error.details.map((err) => ({
            message: err.message,
            path: err.path,
          })),
        });
      request[path] = value;
      return next();
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.stack);
      return response.status(formattedError.status).json({
        status: formattedError.status,
        error: formattedError.message,
      });
    }
  };
}
