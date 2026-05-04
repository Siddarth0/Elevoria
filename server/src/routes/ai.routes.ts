import { Router } from "express";
import { summarizeDocument, generateSubtasks, suggestDeadline } from "@/controllers/ai.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/summarize", authMiddleware, summarizeDocument);
router.post("/subtasks", authMiddleware, generateSubtasks);
router.post("/deadline", authMiddleware, suggestDeadline);

export default router;