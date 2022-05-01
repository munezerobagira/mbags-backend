import express from "express";
import { UserController } from "../../controllers";
import { joiValidator } from "../../middlewares";
import { isLoggedIn } from "../../middlewares/auth";
import { userSchema } from "../../validations";

const router = express.Router();
router.get("/", isLoggedIn, UserController.getUser);
router.patch("/", isLoggedIn, UserController.updateUser);
router.delete("/", isLoggedIn, UserController.deleteUser);
router.get(
  "/verification",
  joiValidator(userSchema.email, "query"),
  UserController.getVerifyToken
);
router.patch("/verification", UserController.verifyProfile);
router.get(
  "/passwordToken",
  joiValidator(userSchema.email, "query"),
  UserController.getPasswordResetToken
);
router.patch("/passwordToken", UserController.getPasswordResetToken);

export default router;
