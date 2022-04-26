import express from "express";
import passport from "passport";
import { AuthenticationController, UserController } from "../controllers";
import { multerUploader } from "../helpers/uploader";
import { joiValidator } from "../middlewares";
import { isLoggedIn } from "../middlewares/auth";
import user from "../validations/user";

const router = express.Router();
router.post(
  "/login",
  joiValidator(user.login),
  passport.authenticate("login", { session: false }),
  AuthenticationController.login
);
router.patch("/signout", isLoggedIn, AuthenticationController.signout);
router.post("/signup", multerUploader.single("profile"), UserController.signup);
export default router;
