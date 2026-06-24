import { api } from "@/lib/api";

export type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export const getNotifications = async (): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> => {
  const res = await api.get("/notification");
  return res.data.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await api.patch(`/notification/${id}/read`);
  return res.data.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch("/notification/read-all");
  return res.data.data;
};
