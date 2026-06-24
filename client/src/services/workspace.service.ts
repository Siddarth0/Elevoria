import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { WorkspaceRole } from "@/types/workspace";

function toSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "workspace";
}

export const getMyWorkspaces = async () => {
  const res = await api.get("/workspace/mine");
  const currentUser = useAuthStore.getState().user;

  return (
    res.data.data as Array<{
      id: string;
      role: WorkspaceRole;
      userId: string;
      workspaceId: string;
      workspace: {
        id: string;
        name: string;
        slug: string;
        ownerId?: string;
        createdAt: string;
        members?: unknown[];
      };
    }>
  ).map((membership) => {
    const workspace = membership.workspace;
    const hasMembers =
      Array.isArray(workspace.members) && workspace.members.length > 0;

    return {
      ...workspace,
      members: hasMembers
        ? workspace.members
        : currentUser && currentUser.id === membership.userId
          ? [
              {
                id: membership.id,
                userId: membership.userId,
                workspaceId: membership.workspaceId,
                role: membership.role,
                user: currentUser,
              },
            ]
          : [],
    };
  });
};

export const createWorkspace = async (name: string) => {
  const res = await api.post("/workspace/create", {
    name,
    slug: toSlug(name),
  });
  return res.data.data;
};

export const addWorkspaceMember = async (data: {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
}) => {
  const res = await api.post("/workspace/add-member", data);
  return res.data.data;
};

export const inviteWorkspaceMember = async (data: {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
}) => {
  const res = await api.post("/workspace/invite", data);
  return res.data.data;
};

export type InviteDetails = {
  email: string;
  role: WorkspaceRole;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  expiresAt: string;
  workspaceName: string;
  expired: boolean;
};

export const getInviteDetails = async (
  token: string,
): Promise<InviteDetails> => {
  const res = await api.get(`/workspace/invite/${token}`);
  return res.data.data;
};

export const acceptWorkspaceInvite = async (token: string) => {
  const res = await api.post("/workspace/accept-invite", { token });
  return res.data.data;
};
