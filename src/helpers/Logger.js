import winston from "winston";

const Logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    ,
    new winston.transports.File({
      filename: "logs/warn.log",
      level: "warn",
    }),
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
    }),
  ],
});

if (process.env.NODE_ENV === "development") {
  Logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
export default Logger;
