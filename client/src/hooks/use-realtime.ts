"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { getSocket } from "@/lib/socket";

/**
 * Connects the authenticated socket, joins the given workspace room, and keeps
 * the board's task cache fresh as other members make changes. Also refreshes
 * the notification cache when a user-targeted notification arrives.
 */
export function useWorkspaceRealtime(workspaceId?: string, boardId?: string) {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !workspaceId) return;

    const socket = getSocket(token);

    const join = () => socket.emit("join-workspace", workspaceId);
    join();
    socket.on("connect", join);

    const refreshTasks = () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      }
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
    };

    const refreshNotifications = () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

    socket.on("task-created", refreshTasks);
    socket.on("task-status-updated", refreshTasks);
    socket.on("task-assigned", refreshTasks);
    socket.on("task-comment-added", refreshTasks);
    socket.on("notification", refreshNotifications);

    return () => {
      socket.off("connect", join);
      socket.off("task-created", refreshTasks);
      socket.off("task-status-updated", refreshTasks);
      socket.off("task-assigned", refreshTasks);
      socket.off("task-comment-added", refreshTasks);
      socket.off("notification", refreshNotifications);
    };
  }, [token, workspaceId, boardId, queryClient]);
}
