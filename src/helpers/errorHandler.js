import errorFormatter from "./errorFormatter";
import Logger from "./Logger";

export default function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    Logger.error(error);
    return next(error);
  }
  Logger.error(error);
  const formattedError = errorFormatter(error);
  return response
    .status(formattedError.status)
    .json({ status: formattedError.status, error: formattedError.message });
}
