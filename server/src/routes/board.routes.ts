import { Router } from "express";
import {
  createBoard,
  getWorkspaceBoards,
  updateBoard,
  deleteBoard,
} from "@/controllers/board.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorizeWorkspaceRoles } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  createBoardSchema,
  updateBoardSchema,
} from "@/validators/board.validator";

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

/**
 * @openapi
 * /board/{id}:
 *   patch:
 *     tags: [Board]
 *     summary: Rename a board (OWNER or MANAGER only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: Board updated }
 *       403: { description: Forbidden }
 *   delete:
 *     tags: [Board]
 *     summary: Delete a board and its tasks (OWNER or MANAGER only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Board deleted }
 *       403: { description: Forbidden }
 */
router.patch("/:id", authMiddleware, validate(updateBoardSchema), updateBoard);
router.delete("/:id", authMiddleware, deleteBoard);

export default router;
