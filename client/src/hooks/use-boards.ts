import { getBoards } from "@/services/board.service";
import { useQuery } from "@tanstack/react-query";

export const useBoards = (workspaceId: string) => {
  return useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () => getBoards(workspaceId),
    enabled: !!workspaceId,
  });
};
