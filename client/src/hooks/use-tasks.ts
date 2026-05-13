import { getTasksByBoard } from "@/services/task.service";
import { useQuery } from "@tanstack/react-query";

export const useTasks = (boardId: string) => {
  return useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => getTasksByBoard(boardId),
    enabled: !!boardId,
  });
};
