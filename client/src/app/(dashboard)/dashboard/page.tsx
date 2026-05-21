"use client";

import CreateWorkspaceModal from "@/components/create-workspace-modal";
import WorkspaceCard from "@/components/workspace-card";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Workspace } from "@/types/workspace";
import { Folder, Layers3, Sparkles, Users } from "lucide-react";

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
      <div className="anim-fade-up rounded-2xl p-7 sm:p-9 glass-panel overflow-hidden relative">
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "rgba(122,162,139,0.22)" }}
        />
        <div
          className="pointer-events-none absolute -left-20 -bottom-24 h-52 w-52 rounded-full blur-3xl"
          style={{ background: "rgba(200,121,90,0.12)" }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold mb-5 tracking-widest uppercase"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString("en-US", { weekday: "long" })} — overview
            </div>
            <h1
              className="font-display leading-[0.95] text-4xl sm:text-5xl"
              style={{ color: "var(--text)" }}
            >
              Your workspaces,
              <br />
              <span className="display-italic" style={{ color: "var(--accent-3)" }}>
                quietly in motion.
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-[15px]" style={{ color: "var(--text-2)" }}>
              Open a workspace, drift through its boards, and let the next piece of work surface itself.
            </p>
          </div>
          <CreateWorkspaceModal />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Workspaces", value: workspaces.length, icon: Layers3, color: "var(--accent)" },
          { label: "Active boards", value: "Live", icon: Folder, color: "var(--accent-3)" },
          { label: "Team ready", value: "Synced", icon: Users, color: "var(--accent-2)" },
        ].map((item, i) => (
          <div key={item.label} className="card p-4 anim-fade-up" style={{ animationDelay: `${(i + 1) * 0.05}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-extrabold" style={{ color: "var(--text)" }}>
                  {item.value}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${item.color}1F`, color: item.color }}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between anim-fade-up d2 pt-2">
        <div>
          <p
            className="text-[10px] font-bold tracking-[0.24em] uppercase mb-2 flex items-center gap-2"
            style={{ color: "var(--text-3)" }}
          >
            <span
              className="inline-block h-px w-7"
              style={{ background: "var(--text-3)" }}
            />
            Library
          </p>
          <h2
            className="font-display leading-none text-3xl sm:text-4xl"
            style={{ color: "var(--text)" }}
          >
            All workspaces
          </h2>
        </div>
        <p
          className="text-xs hidden sm:block"
          style={{ color: "var(--text-3)" }}
        >
          {workspaces.length} active
        </p>
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
