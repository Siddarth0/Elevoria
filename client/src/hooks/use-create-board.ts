import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "@/services/board.service";

export const useCreateBoard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
    },
  });
};
