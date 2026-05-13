import { Workspace } from "@/types/workspace";

export default function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <div className="border rounded-2xl p-5 hover:shadow-md transition cursor-pointer">
      <h2 className="font-semibold text-lg">{workspace.name}</h2>

      <p className="text-sm text-gray-500 mt-1">/{workspace.slug}</p>

      <p className="text-xs text-gray-400 mt-4">
        Created {new Date(workspace.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
