import { attachFileToTask } from "@/services/task.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAttachFile = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attachFileToTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });
};
