import routes from "./routes";
import express from "express";
import { SampleController } from "./controllers";
import fs from "fs";
import { uploadFolder } from "./config";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerDocument from "./swagger.json";
import cors from "cors";
if (!fs.existsSync(uploadFolder))
  fs.mkdirSync(uploadFolder, { recursive: true });

// const openapispecification = swaggerJsDoc(swaggerDocument);
export default function setupApp(app) {
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use("/public", express.static(uploadFolder));
  app.use("/api", routes);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  app.use("*", SampleController.notFound);
}
