import { Router } from "express";
import {
  createBoard,
  getWorkspaceBoards,
} from "@/controllers/board.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorizeWorkspaceRoles } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createBoardSchema } from "@/validators/board.validator";

const router = Router();

/**
 * @openapi
 * /board/create:
 *   post:
 *     tags:
 *       - Board
 *     summary: Create a new board in a workspace (OWNER or MANAGER only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, workspaceId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sprint 1
 *               workspaceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Board created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — requires OWNER or MANAGER role
 */
router.post(
  "/create",
  authMiddleware,
  validate(createBoardSchema),
  authorizeWorkspaceRoles(["OWNER", "MANAGER"]),
  createBoard,
);

/**
 * @openapi
 * /board/{workspaceId}:
 *   get:
 *     tags:
 *       - Board
 *     summary: Get all boards in a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Boards fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/:workspaceId", authMiddleware, getWorkspaceBoards);

export default router;
