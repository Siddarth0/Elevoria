import { api } from "@/lib/api";
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
  // Backend returns WorkspaceMember[] with nested workspace object
  return (res.data.data as Array<{ workspace: unknown }>).map(
    (m) => m.workspace,
  );
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
