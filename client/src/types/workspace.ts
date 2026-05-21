export type WorkspaceRole = "OWNER" | "MANAGER" | "MEMBER";

export type WorkspaceMember = {
  id: string;
  userId?: string;
  workspaceId?: string;
  role: WorkspaceRole;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  ownerId?: string;
  createdAt: string;
  members?: WorkspaceMember[];
};
