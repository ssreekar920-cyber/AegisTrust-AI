import express from "express";
import { z } from "zod";
import authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("A valid email address is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("A valid email address is required"),
  password: z.string().min(1, "Password is required"),
});

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticateToken, authController.getMe);

export default router;
