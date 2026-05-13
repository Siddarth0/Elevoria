"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Task, TaskStatus } from "@/types/task";
import { Workspace } from "@/types/workspace";
import TaskCard from "@/components/task-card";
import TaskDetailModal from "@/components/task-detail-modal";
import CreateTaskModal from "@/components/create-task-modal";
import { MoreHorizontal, Plus } from "lucide-react";

type Column = {
  status: TaskStatus;
  label: string;
  color: string;
};

const COLUMNS: Column[] = [
  { status: "TODO",        label: "To Do",       color: "#6B6B80" },
  { status: "IN_PROGRESS", label: "In Progress",  color: "#7A70F0" },
  { status: "REVIEW",      label: "In Review",    color: "#F5A623" },
  { status: "COMPLETED",   label: "Completed",    color: "#22D1A8" },
];

export default function BoardPage() {
  const { workspaceId, boardId } = useParams<{
    workspaceId: string;
    boardId: string;
  }>();

  const { data: tasks, isLoading } = useTasks(boardId);
  const { data: workspaces } = useWorkspaces();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const workspace = (workspaces as Workspace[] | undefined)?.find(
    (w) => w.id === workspaceId,
  );
  const members = workspace?.members || [];

  const grouped = (tasks as Task[] | undefined)?.reduce<
    Record<TaskStatus, Task[]>
  >(
    (acc, t) => { acc[t.status].push(t); return acc; },
    { TODO: [], IN_PROGRESS: [], REVIEW: [], COMPLETED: [] },
  ) ?? { TODO: [], IN_PROGRESS: [], REVIEW: [], COMPLETED: [] };

  if (isLoading) {
    return (
      <div className="flex gap-6 h-full pt-2">
        {COLUMNS.map((col) => (
          <div key={col.status} className="w-72 min-w-72 space-y-3">
            <div className="h-6 w-32 rounded-lg animate-pulse" style={{ background: "var(--elevated)" }} />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Page header */}
      <div className="shrink-0 anim-fade-up">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Board view
        </p>
        <div className="flex items-center gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col.status}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--text-3)" }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: col.color }}
              />
              <span>{grouped[col.status].length} {col.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-5 overflow-x-auto pb-4 flex-1 items-start anim-fade-up d2">
        {COLUMNS.map((col) => {
          const colTasks = grouped[col.status];
          return (
            <div key={col.status} className="w-72 min-w-72 flex flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: col.color }}
                  />
                  <h2
                    className="text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {col.label}
                  </h2>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${col.color}18`,
                      color: col.color,
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-3)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "var(--text)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "var(--text-3)")
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-3)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "var(--text)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "var(--text-3)")
                    }
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>

              {/* Add task */}
              <CreateTaskModal
                boardId={boardId}
                defaultStatus={col.status}
                members={members}
              />
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          boardId={boardId}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
