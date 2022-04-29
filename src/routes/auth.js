import express from "express";
import { AuthenticationController, UserController } from "../controllers";
import { joiValidator } from "../middlewares";
import { isLoggedIn } from "../middlewares/auth";
import user from "../validations/user";

const router = express.Router();
router.post("/login", joiValidator(user.login), AuthenticationController.login);
router.patch("/signout", isLoggedIn, AuthenticationController.signout);
router.post("/signup", joiValidator(user.signup), UserController.signup);
export default router;
