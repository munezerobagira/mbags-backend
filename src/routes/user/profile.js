import express from "express";
import { UserController } from "../../controllers";
import { multerUploader } from "../../helpers/uploader";
import { joiValidator } from "../../middlewares";
import { isLoggedIn } from "../../middlewares/auth";
import { userSchema } from "../../validations";

const router = express.Router();
router.get("/", isLoggedIn, UserController.getUser);
router.patch(
  "/",
  multerUploader.single("profilePic"),
  isLoggedIn,
  joiValidator(userSchema.profile),
  UserController.updateUser
);
router.delete("/", isLoggedIn, UserController.deleteUser);
router.get(
  "/verification",
  joiValidator(userSchema.id, "query"),
  UserController.getVerifyToken
);
router.patch("/verification", UserController.verifyProfile);
router.get(
  "/passwordToken",
  joiValidator(userSchema.id, "query"),
  UserController.getPasswordResetToken
);
router.patch("/passwordToken", UserController.getPasswordResetToken);

export default router;

