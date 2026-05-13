import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskStatus } from "@/services/task.service";

export const useUpdateTaskStatus = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });
};
