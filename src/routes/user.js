import express from "express";
import { UserController } from "../controllers";
import { multerUploader } from "../helpers/uploader";
import { isLoggedIn } from "../middlewares/auth";
const router = express.Router();
router.get("/profile", isLoggedIn, UserController.getUser);
router.patch("/profile", isLoggedIn, UserController.updateUser);
router.delete("/", UserController.deleteUser);
export default router;
