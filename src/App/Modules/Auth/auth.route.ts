import express from "express";
import USER_ROLE from "../../constants/userRole";
import { validateRequest } from "../../utility/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidations } from "./auth.validation";
import auth from "../../Middlewares/Auth";
const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidations.loginValidationSchema),
  AuthController.loginUser
);

router.post(
  "/change-password",
  auth(USER_ROLE.admin, USER_ROLE.doctor, USER_ROLE.patient, USER_ROLE.staff),
  validateRequest(AuthValidations.chnagePasswordValidationSchema),
  AuthController.changePassword
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidations.refreshTokenValidationSchema),
  AuthController.refreshToken
);

router.post(
  "/forget-password",
  validateRequest(AuthValidations.forgetPasswordValidationSchema),
  AuthController.forgetPassword
);

router.post(
  "/reset-password",
  validateRequest(AuthValidations.resetPasswordValidationSchema),
  AuthController.resetPassword
);

export const AuthRouter = router;
