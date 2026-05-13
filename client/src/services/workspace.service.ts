import { api } from "@/lib/api";

export const getMyWorkspaces = async () => {
  const res = await api.get("/workspace/mine");
  return res.data.data;
};
