import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";

export const getMyNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json(
      new ApiResponse("Notifications fetched", { notifications, unreadCount }),
    );
  },
);

export const markNotificationRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) throw new ApiError(401, "Unauthorized");

    // Scope the update to the caller so users can only touch their own rows.
    const result = await prisma.notification.updateMany({
      where: { id: String(id), userId },
      data: { isRead: true },
    });

    if (result.count === 0) throw new ApiError(404, "Notification not found");

    res.json(new ApiResponse("Notification marked as read"));
  },
);

export const markAllNotificationsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(401, "Unauthorized");

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json(new ApiResponse("All notifications marked as read"));
  },
);
