import express from "express";
import mongoose from "mongoose";
import { port, mongoUrl } from "./config";
import setupApp from "./setupApp";
const app = express();
setupApp(app);
mongoose.connect(mongoUrl).then(() => {
  console.log("connected to db");
});
export default app.listen(port, () => {
  console.log("Server started on port", port);
});
