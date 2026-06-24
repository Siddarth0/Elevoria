import { Router } from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/controllers/notification.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /notification:
 *   get:
 *     tags:
 *       - Notification
 *     summary: List the authenticated user's notifications (newest first)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getMyNotifications);

/**
 * @openapi
 * /notification/read-all:
 *   patch:
 *     tags:
 *       - Notification
 *     summary: Mark all of the user's notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch("/read-all", authMiddleware, markAllNotificationsRead);

/**
 * @openapi
 * /notification/{id}/read:
 *   patch:
 *     tags:
 *       - Notification
 *     summary: Mark a single notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch("/:id/read", authMiddleware, markNotificationRead);

export default router;
