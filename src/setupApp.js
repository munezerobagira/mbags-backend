import routes from "./routes";
import express from "express";
import { SampleController } from "./controllers";
export default function setupApp(app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", routes);
  app.use("*", SampleController.notFound);
}
