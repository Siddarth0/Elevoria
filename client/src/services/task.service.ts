import { api } from "@/lib/api";
import { TaskPriority, TaskStatus } from "@/types/task";

export const getTasksByBoard = async (boardId: string) => {
  const res = await api.get(`/task/board/${boardId}`);
  return res.data.data;
};

export const createTask = async (data: {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  boardId: string;
  assigneeId?: string;
}) => {
  const res = await api.post("/task/create", data);
  return res.data.data;
};

export const updateTaskStatus = async (data: {
  taskId: string;
  status: TaskStatus;
}) => {
  const res = await api.patch("/task/status", data);
  return res.data.data;
};

export const addComment = async (data: {
  taskId: string;
  content: string;
}) => {
  const res = await api.post("/task/comment", data);
  return res.data.data;
};
