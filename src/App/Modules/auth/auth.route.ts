import express from "express";
import USER_ROLE from "../../constants/userRole";
import { AuthController } from "./auth.controller";
import auth from "../../Middlewares/auth";

const router = express.Router();
router.post("/login", AuthController.loginUser);
router.post(
  "/change-password",
  auth(USER_ROLE.admin, USER_ROLE.user),
  AuthController.changePassword
);

router.post("/refresh-token", AuthController.refreshToken);

router.patch("/forget-password", AuthController.forgetPassword);

router.post("/reset-password", AuthController.resetPassword);

export const authRoute = router;
