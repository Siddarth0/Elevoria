import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});

export const addMemberSchema = z.object({
  workspaceId: z.string().uuid(),
  email: z.email(),
  role: z.enum(["OWNER", "MANAGER", "MEMBER"]),
});

export const inviteMemberSchema = z.object({
  workspaceId: z.string().uuid(),
  email: z.email(),
  role: z.enum(["OWNER", "MANAGER", "MEMBER"]).default("MEMBER"),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
});