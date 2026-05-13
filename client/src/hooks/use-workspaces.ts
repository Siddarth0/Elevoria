import { getMyWorkspaces } from "@/services/workspace.service";
import { useQuery } from "@tanstack/react-query";

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: getMyWorkspaces,
  });
};
