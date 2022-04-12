import routes from "./routes";
import express from "express";
import { SampleController } from "./controllers";
import fs from "fs";
import { uploadFolder } from "./config";
if (!fs.existsSync(uploadFolder))
  fs.mkdirSync(uploadFolder, { recursive: true });
export default function setupApp(app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/public", express.static(uploadFolder));
  app.use("/api", routes);
  app.use("*", SampleController.notFound);
}
