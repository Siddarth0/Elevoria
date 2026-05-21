import { Router } from "express";
import { summarizeDocument, generateSubtasks, suggestDeadline } from "@/controllers/ai.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     AiSummaryResult:
 *       type: object
 *       properties:
 *         scope: { type: string, enum: [task, board, workspace, text] }
 *         title: { type: string }
 *         summary: { type: string }
 *         highlights:
 *           type: array
 *           items: { type: string }
 *         unavailable: { type: boolean, nullable: true }
 *     AiSubtasksResult:
 *       type: object
 *       properties:
 *         scope: { type: string, enum: [task, board, workspace, text] }
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               taskTitle: { type: string }
 *               subtasks:
 *                 type: array
 *                 items: { type: string }
 *         unavailable: { type: boolean, nullable: true }
 *     AiDeadlineResult:
 *       type: object
 *       properties:
 *         scope: { type: string, enum: [task, board, workspace, text] }
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               taskTitle: { type: string }
 *               suggestedDate: { type: string, example: "2026-06-12" }
 *               reason: { type: string }
 *         unavailable: { type: boolean, nullable: true }
 */

/**
 * @openapi
 * /ai/summarize:
 *   post:
 *     tags: [AI]
 *     summary: Summarize the active scope (workspace / board / task) or pasted text
 *     description: |
 *       Scope is resolved in priority order: `taskId` → `boardId` → `content` text → `workspaceId`.
 *       Returns a structured JSON summary keyed by the resolved scope.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId]
 *             properties:
 *               workspaceId: { type: string, format: uuid }
 *               boardId:     { type: string, format: uuid, nullable: true }
 *               taskId:      { type: string, format: uuid, nullable: true }
 *               content:     { type: string, nullable: true, description: "Optional refinement, or the text to summarize when no scope IDs are given." }
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
 *                         result: { $ref: '#/components/schemas/AiSummaryResult' }
 *       401: { description: Unauthorized }
 */
router.post("/summarize", authMiddleware, summarizeDocument);

/**
 * @openapi
 * /ai/subtasks:
 *   post:
 *     tags: [AI]
 *     summary: Draft subtasks scoped to a task, board, workspace, or pasted text
 *     description: |
 *       Scope is resolved in priority order: `taskId` → `boardId` → `description` text → `workspaceId`.
 *       For board/workspace scopes the response contains one item per target task (up to 5 highest-priority open tasks).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId]
 *             properties:
 *               workspaceId: { type: string, format: uuid }
 *               boardId:     { type: string, format: uuid, nullable: true }
 *               taskId:      { type: string, format: uuid, nullable: true }
 *               description: { type: string, nullable: true, description: "Optional refinement, or the text to break down when no scope IDs are given." }
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
 *                         result: { $ref: '#/components/schemas/AiSubtasksResult' }
 *       401: { description: Unauthorized }
 */
router.post("/subtasks", authMiddleware, generateSubtasks);

/**
 * @openapi
 * /ai/deadline:
 *   post:
 *     tags: [AI]
 *     summary: Suggest deadlines scoped to a task, board, workspace, or pasted text
 *     description: |
 *       Scope is resolved in priority order: `taskId` → `boardId` → `description` text → `workspaceId`.
 *       For board/workspace scopes the response covers up to 5 undated open tasks.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId]
 *             properties:
 *               workspaceId: { type: string, format: uuid }
 *               boardId:     { type: string, format: uuid, nullable: true }
 *               taskId:      { type: string, format: uuid, nullable: true }
 *               description: { type: string, nullable: true, description: "Optional refinement, or the text to estimate against when no scope IDs are given." }
 *     responses:
 *       200:
 *         description: AI deadline suggestions generated
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
 *                         result: { $ref: '#/components/schemas/AiDeadlineResult' }
 *       401: { description: Unauthorized }
 */
router.post("/deadline", authMiddleware, suggestDeadline);

export default router;
