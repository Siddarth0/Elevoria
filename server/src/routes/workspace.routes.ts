import { Router } from "express";
import {
  createWorkspace,
  getMyWorkspaces,
  addMemberToWorkspace,
} from "@/controllers/workspace.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorizeWorkspaceRoles } from "@/middlewares/role.middleware";

const router = Router();

router.post("/create", authMiddleware, createWorkspace);
router.get("/mine", authMiddleware, getMyWorkspaces);

router.post(
  "/add-member",
  authMiddleware,
  authorizeWorkspaceRoles(["OWNER", "MANAGER"]),
  addMemberToWorkspace,
);

export default router;
