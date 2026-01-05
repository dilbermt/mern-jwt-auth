import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller";

// prefix: /auth

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/refresh", refreshHandler);
router.get("/logout", logoutHandler);
router.get("/email/verify/:code", verifyEmailHandler);

export default router;
