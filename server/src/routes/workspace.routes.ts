import { Router } from "express";
import {
  createWorkspace,
  getMyWorkspaces,
  addMemberToWorkspace,
} from "@/controllers/workspace.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorizeWorkspaceRoles } from "@/middlewares/role.middleware";

const router = Router();

/**
 * @openapi
 * /workspace/create:
 *   post:
 *     tags:
 *       - Workspace
 *     summary: Create a new workspace
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: My Workspace
 *               slug:
 *                 type: string
 *                 minLength: 2
 *                 example: my-workspace
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Workspace slug already taken
 *       401:
 *         description: Unauthorized
 */
router.post("/create", authMiddleware, createWorkspace);

/**
 * @openapi
 * /workspace/mine:
 *   get:
 *     tags:
 *       - Workspace
 *     summary: Get all workspaces the authenticated user belongs to
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspaces fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/mine", authMiddleware, getMyWorkspaces);

/**
 * @openapi
 * /workspace/add-member:
 *   post:
 *     tags:
 *       - Workspace
 *     summary: Add a member to a workspace (OWNER or MANAGER only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, email, role]
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 format: uuid
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               role:
 *                 type: string
 *                 enum: [OWNER, MANAGER, MEMBER]
 *                 example: MEMBER
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: User already is a member
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — requires OWNER or MANAGER role
 *       404:
 *         description: User not found
 */
router.post(
  "/add-member",
  authMiddleware,
  authorizeWorkspaceRoles(["OWNER", "MANAGER"]),
  addMemberToWorkspace,
);

export default router;
