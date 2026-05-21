import { addWorkspaceMember } from "@/services/workspace.service";
import { Workspace, WorkspaceRole } from "@/types/workspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AddMemberInput = {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
};

function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || email;
}

export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWorkspaceMember,
    onSuccess: (member, variables: AddMemberInput) => {
      queryClient.setQueryData<Workspace[]>(["workspaces"], (old) => {
        if (!old) return old;

        return old.map((workspace) => {
          if (workspace.id !== variables.workspaceId) return workspace;

          const members = workspace.members ?? [];
          if (members.some((m) => m.user.id === member.userId)) {
            return workspace;
          }

          return {
            ...workspace,
            members: [
              ...members,
              {
                id: member.id,
                userId: member.userId,
                workspaceId: variables.workspaceId,
                role: variables.role,
                user: {
                  id: member.userId,
                  email: variables.email,
                  fullName: nameFromEmail(variables.email),
                },
              },
            ],
          };
        });
      });
    },
  });
};
