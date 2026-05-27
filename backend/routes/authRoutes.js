import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  login,
  register,
  logout,
  isLoggedIn,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", authMiddleware, isLoggedIn);

export default router;
