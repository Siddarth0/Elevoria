import { Router } from "express";
import {
  createWorkspace,
  getMyWorkspaces,
  addMemberToWorkspace,
  inviteMember,
  getInvite,
  acceptInvite,
} from "@/controllers/workspace.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorizeWorkspaceRoles } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  createWorkspaceSchema,
  addMemberSchema,
  inviteMemberSchema,
  acceptInviteSchema,
} from "@/validators/workspace.validator";

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
router.post(
  "/create",
  authMiddleware,
  validate(createWorkspaceSchema),
  createWorkspace,
);

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
  validate(addMemberSchema),
  authorizeWorkspaceRoles(["OWNER", "MANAGER"]),
  addMemberToWorkspace,
);

/**
 * @openapi
 * /workspace/invite:
 *   post:
 *     tags: [Workspace]
 *     summary: Invite someone by email (OWNER or MANAGER only)
 *     description: Works whether or not the invitee already has an account. Emails a tokened accept link.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, email]
 *             properties:
 *               workspaceId: { type: string, format: uuid }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [OWNER, MANAGER, MEMBER], default: MEMBER }
 *     responses:
 *       201: { description: Invite sent }
 *       400: { description: User is already a member }
 *       403: { description: Forbidden — requires OWNER or MANAGER role }
 */
router.post(
  "/invite",
  authMiddleware,
  validate(inviteMemberSchema),
  authorizeWorkspaceRoles(["OWNER", "MANAGER"]),
  inviteMember,
);

/**
 * @openapi
 * /workspace/invite/{token}:
 *   get:
 *     tags: [Workspace]
 *     summary: Look up invite details by token (public landing page)
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Invite fetched }
 *       404: { description: Invite not found }
 */
router.get("/invite/:token", getInvite);

/**
 * @openapi
 * /workspace/accept-invite:
 *   post:
 *     tags: [Workspace]
 *     summary: Accept a workspace invite as the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200: { description: Invite accepted }
 *       400: { description: Invalid or expired invite }
 *       403: { description: Invite issued to a different email }
 */
router.post(
  "/accept-invite",
  authMiddleware,
  validate(acceptInviteSchema),
  acceptInvite,
);

export default router;
