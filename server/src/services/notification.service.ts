import { prisma } from "@/lib/prisma";
import { emitUserEvent } from "@/services/realtime.service";

/**
 * Persist a notification for a user and push it over the socket in real time.
 * Best-effort: never throws into the calling request flow.
 */
export async function notifyUser(userId: string, message: string) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, message },
    });

    emitUserEvent(userId, "notification", notification);

    return notification;
  } catch {
    // notifications are best-effort; don't break the triggering action
    return null;
  }
}
