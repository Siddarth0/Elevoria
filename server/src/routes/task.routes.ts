import { Router } from "express";
import {
  createTask,
  getTasksByBoard,
  updateTaskStatus,
  assignTask,
  addCommentToTask,
} from "@/controllers/task.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/create", authMiddleware, createTask);
router.get("/board/:boardId", authMiddleware, getTasksByBoard);
router.patch("/status", authMiddleware, updateTaskStatus);
router.patch("/assign", authMiddleware, assignTask);
router.post("/comment", authMiddleware, addCommentToTask);

export default router;