export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";

export type TaskUser = {
  id: string;
  fullName: string;
  email: string;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: TaskUser;
};

export type Attachment = {
  id: string;
  fileUrl?: string;
  fileName?: string;
  url?: string;
  filename?: string;
  uploadedAt?: string;
  createdAt?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  boardId: string;
  assignee?: TaskUser | null;
  creator: TaskUser;
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
};
