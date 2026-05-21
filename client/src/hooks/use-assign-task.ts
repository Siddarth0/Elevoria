import { assignTask } from "@/services/task.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAssignTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });
};
