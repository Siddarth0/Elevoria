import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment } from "@/services/task.service";

export const useAddComment = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });
};
