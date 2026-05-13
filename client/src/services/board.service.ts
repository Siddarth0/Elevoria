import { api } from "@/lib/api";

export const getBoards = async (workspaceId: string) => {
  const res = await api.get(`/board/${workspaceId}`);
  return res.data.data;
};

export const createBoard = async (data: {
  name: string;
  workspaceId: string;
}) => {
  const res = await api.post("/board/create", data);
  return res.data.data;
};
