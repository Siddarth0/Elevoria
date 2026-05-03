import { Router } from "express";
import { login, logout, refreshAccessToken, register } from "@/controllers/auth.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { loginSchema, registerSchema } from "@/validators/auth.validators";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema) , login);
router.post("/logout", logout);

router.post("/refresh", refreshAccessToken);

export default router;
