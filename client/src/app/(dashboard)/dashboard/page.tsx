"use client";

import CreateWorkspaceModal from "@/components/create-workspace-modal";
import WorkspaceCard from "@/components/workspace-card";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Workspace } from "@/types/workspace";
import { Folder } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useWorkspaces();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: "var(--elevated)" }} />
            <div className="h-8 w-56 rounded-xl animate-pulse" style={{ background: "var(--elevated)" }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl animate-pulse"
              style={{ background: "var(--surface)", animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const workspaces = (data as Workspace[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between anim-fade-up">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-3)" }}
          >
            Overview
          </p>
          <h1
            className="font-extrabold leading-none"
            style={{ fontSize: "1.875rem", color: "var(--text)", letterSpacing: "-0.02em" }}
          >
            Your Workspaces
          </h1>
        </div>
        <div className="anim-fade-up d2">
          <CreateWorkspaceModal />
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div
          className="rounded-2xl p-14 text-center anim-fade-up d2"
          style={{ border: "1px dashed var(--border-md)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--elevated)" }}
          >
            <Folder className="w-5 h-5" style={{ color: "var(--text-3)" }} />
          </div>
          <h2 className="font-bold text-base mb-1" style={{ color: "var(--text)" }}>
            No workspaces yet
          </h2>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Create your first workspace to start collaborating.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspaces.map((workspace, i) => (
            <div
              key={workspace.id}
              className="anim-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <WorkspaceCard workspace={workspace} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
