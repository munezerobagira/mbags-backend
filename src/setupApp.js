import express from "express";
import fs from "fs";
import swaggerUI from "swagger-ui-express";
import morgan from "morgan";
import cors from "cors";
import { join as joinPath } from "path";
import routes from "./routes";
import { logsFolder, uploadFolder } from "./config";
import { SampleController } from "./controllers";
import openapiSpecification from "./openapi.json";

if (!fs.existsSync(uploadFolder))
  fs.mkdirSync(uploadFolder, { recursive: true });
if (!fs.existsSync(logsFolder)) fs.mkdirSync(logsFolder, { recursive: true });

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  joinPath(logsFolder, "access.log"),
  { flags: "a" }
);
// setup the logger
export default function setupApp(app) {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("combined", { stream: accessLogStream }));
  app.use("/public", express.static(uploadFolder));
  app.use("/api", routes);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openapiSpecification));
  app.use("*", SampleController.notFound);
}
