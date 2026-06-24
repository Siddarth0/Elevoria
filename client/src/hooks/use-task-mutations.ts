import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateTask,
  deleteTask,
  deleteComment,
  deleteAttachment,
} from "@/services/task.service";

/** Shared invalidation for anything that changes a board's tasks. */
function useTaskInvalidator(boardId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
}

export const useUpdateTask = (boardId: string) => {
  const invalidate = useTaskInvalidator(boardId);
  return useMutation({ mutationFn: updateTask, onSuccess: invalidate });
};

export const useDeleteTask = (boardId: string) => {
  const invalidate = useTaskInvalidator(boardId);
  return useMutation({ mutationFn: deleteTask, onSuccess: invalidate });
};

export const useDeleteComment = (boardId: string) => {
  const invalidate = useTaskInvalidator(boardId);
  return useMutation({ mutationFn: deleteComment, onSuccess: invalidate });
};

export const useDeleteAttachment = (boardId: string) => {
  const invalidate = useTaskInvalidator(boardId);
  return useMutation({ mutationFn: deleteAttachment, onSuccess: invalidate });
};
