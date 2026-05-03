import { Router } from "express";
import {
  createBoard,
  getWorkspaceBoards,
} from "@/controllers/board.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorizeWorkspaceRoles } from "@/middlewares/role.middleware";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  authorizeWorkspaceRoles(["OWNER", "MANAGER"]),
  createBoard,
);
router.get("/:workspaceId", authMiddleware, getWorkspaceBoards);

export default router;
