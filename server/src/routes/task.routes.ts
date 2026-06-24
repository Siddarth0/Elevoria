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
import {
  createTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
  addCommentSchema,
  attachFileSchema,
} from "@/validators/task.validator";
import { upload } from "@/middlewares/upload.middleware";

const router = Router();

/**
 * @openapi
 * /task/create:
 *   post:
 *     tags:
 *       - Task
 *     summary: Create a new task on a board
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, boardId]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 example: Implement auth
 *               description:
 *                 type: string
 *                 example: Add JWT authentication flow
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 example: HIGH
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-01T00:00:00.000Z"
 *               boardId:
 *                 type: string
 *                 format: uuid
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Task created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — user is not a workspace member
 */
router.post("/create", authMiddleware, validate(createTaskSchema), createTask);

/**
 * @openapi
 * /task/board/{boardId}:
 *   get:
 *     tags:
 *       - Task
 *     summary: Get all tasks for a board
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/board/:boardId", authMiddleware, getTasksByBoard);

/**
 * @openapi
 * /task/status:
 *   patch:
 *     tags:
 *       - Task
 *     summary: Update the status of a task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId, status]
 *             properties:
 *               taskId:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, REVIEW, COMPLETED]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Task status updated
 *       401:
 *         description: Unauthorized
 */
router.patch("/status", authMiddleware, validate(updateTaskStatusSchema), updateTaskStatus);

/**
 * @openapi
 * /task/assign:
 *   patch:
 *     tags:
 *       - Task
 *     summary: Assign a task to a user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId, assigneeId]
 *             properties:
 *               taskId:
 *                 type: string
 *                 format: uuid
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/assign", authMiddleware, validate(assignTaskSchema), assignTask);

/**
 * @openapi
 * /task/comment:
 *   post:
 *     tags:
 *       - Task
 *     summary: Add a comment to a task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId, content]
 *             properties:
 *               taskId:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *                 example: Looks good, merging!
 *     responses:
 *       201:
 *         description: Comment added
 *       401:
 *         description: Unauthorized
 */
router.post("/comment", authMiddleware, validate(addCommentSchema), addCommentToTask);

/**
 * @openapi
 * /task/attach:
 *   post:
 *     tags:
 *       - Task
 *     summary: Attach a file to a task (uploaded to Cloudinary)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [taskId, file]
 *             properties:
 *               taskId:
 *                 type: string
 *                 format: uuid
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — user is not a workspace member
 */
router.post(
  "/attach",
  authMiddleware,
  upload.single("file"),
  validate(attachFileSchema),
  attachFileToTask,
);

export default router;
