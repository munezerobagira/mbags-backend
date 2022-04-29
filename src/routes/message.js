import express from "express";
import { MessageController } from "../controllers";
import { joiValidator } from "../middlewares";
import { isLoggedIn, checkRole } from "../middlewares/auth";
import { messageSchema } from "../validations";

const router = express.Router();
router.get(
  "/",
  isLoggedIn,
  checkRole("admin"),
  MessageController.fetchMessages
);
router.post(
  "/",
  joiValidator(messageSchema.createMessage),
  MessageController.addMessage
);
router.get(
  "/:id",
  isLoggedIn,
  checkRole("admin"),
  MessageController.fetchMessage
);
router.patch(
  "/:id",
  isLoggedIn,
  joiValidator(messageSchema.updateMessage),
  checkRole("admin"),
  MessageController.updateMessage
);
router.delete(
  "/:id",
  isLoggedIn,
  checkRole("admin"),
  MessageController.deleteMessage
);
export default router;
