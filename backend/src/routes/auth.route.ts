import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  resetPasswordHandler,
  sendPasswordResetHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller";

// prefix: /auth

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/refresh", refreshHandler);
router.get("/logout", logoutHandler);
router.get("/email/verify/:code", verifyEmailHandler);
router.post("/password/forgot", sendPasswordResetHandler);
router.post("/password/reset", resetPasswordHandler);

export default router;
