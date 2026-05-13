import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspace } from "@/services/workspace.service";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
  });
};