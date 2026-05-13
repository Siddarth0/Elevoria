"use client";

import WorkspaceCard from "@/components/workspace-card";
import { useWorkspaces } from "@/hooks/use-workspaces";

export default function DashboardPage() {
  const { data, isLoading } = useWorkspaces();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-52 bg-gray-200 animate-pulse rounded" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const workspaces = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Workspaces</h1>

          <p className="text-gray-500 mt-1">
            Manage your collaborative projects.
          </p>
        </div>

        <button className="bg-black text-white px-4 py-2 rounded-xl">
          Create Workspace
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="border rounded-2xl p-10 text-center">
          <h2 className="font-semibold text-xl">No workspaces yet</h2>

          <p className="text-gray-500 mt-2">
            Create your first collaborative workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {workspaces.map((workspace: any) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </div>
  );
}
