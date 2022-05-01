import express from "express";
import mongoose from "mongoose";
import { port, mongoUrl } from "./config";
import Logger from "./helpers/Logger";
import setupApp from "./setupApp";

const app = express();
setupApp(app);
mongoose.connect(mongoUrl).then(() => {
  Logger.info("connected to db");
});
export default app.listen(port, () => {
  Logger.info(`Server started on port ${port}`);
});
