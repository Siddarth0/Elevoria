import { Router } from "express";
import { summarizeDocument, generateSubtasks, suggestDeadline } from "@/controllers/ai.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /ai/summarize:
 *   post:
 *     tags:
 *       - AI
 *     summary: Summarize document content using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, workspaceId]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Long document text to summarize..."
 *               workspaceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: AI summary generated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         result:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.post("/summarize", authMiddleware, summarizeDocument);

/**
 * @openapi
 * /ai/subtasks:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate subtasks from a task description using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, workspaceId]
 *             properties:
 *               description:
 *                 type: string
 *                 example: Build a user authentication system with JWT
 *               workspaceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: AI subtasks generated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         result:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.post("/subtasks", authMiddleware, generateSubtasks);

/**
 * @openapi
 * /ai/deadline:
 *   post:
 *     tags:
 *       - AI
 *     summary: Suggest a deadline for a task using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, workspaceId]
 *             properties:
 *               description:
 *                 type: string
 *                 example: Implement login and registration with email verification
 *               workspaceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: AI deadline suggestion generated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         result:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.post("/deadline", authMiddleware, suggestDeadline);

export default router;