import { Router } from "express";
import {
  createTask,
  getTasksByBoard,
  updateTaskStatus,
  assignTask,
  addCommentToTask,
  attachFileToTask,
} from "@/controllers/task.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createTaskSchema } from "@/validators/task.validator";
import { upload } from "@/middlewares/upload.middleware";

const router = Router();

router.post("/create", authMiddleware, validate(createTaskSchema), createTask);
router.get("/board/:boardId", authMiddleware, getTasksByBoard);
router.patch("/status", authMiddleware, updateTaskStatus);
router.patch("/assign", authMiddleware, assignTask);
router.post("/comment", authMiddleware, addCommentToTask);

router.post("/attach", authMiddleware, upload.single("file"), attachFileToTask);

export default router;
