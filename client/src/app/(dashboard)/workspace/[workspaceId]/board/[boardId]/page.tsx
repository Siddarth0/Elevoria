"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { useTasks } from "@/hooks/use-tasks";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useUpdateTaskStatus } from "@/hooks/use-update-task-status";
import { useWorkspaceRealtime } from "@/hooks/use-realtime";
import { Task, TaskStatus } from "@/types/task";
import { Workspace } from "@/types/workspace";
import TaskCard from "@/components/task-card";
import TaskDetailModal from "@/components/task-detail-modal";
import CreateTaskModal from "@/components/create-task-modal";
import { Search } from "lucide-react";

type Column = {
  status: TaskStatus;
  label: string;
  color: string;
};

const COLUMNS: Column[] = [
  { status: "TODO",        label: "To Do",       color: "#8B9694" },
  { status: "IN_PROGRESS", label: "In Progress",  color: "#4D9170" },
  { status: "REVIEW",      label: "In Review",    color: "#C49A4A" },
  { status: "COMPLETED",   label: "Completed",    color: "#6F9D72" },
];

const EMPTY_GROUPS = (): Record<TaskStatus, Task[]> => ({
  TODO: [],
  IN_PROGRESS: [],
  REVIEW: [],
  COMPLETED: [],
});

function DraggableCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: "none" }}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

function DroppableColumn({
  status,
  children,
}: {
  status: TaskStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="w-72 min-w-72 flex flex-col gap-3 rounded-2xl p-3 transition-colors"
      style={{
        background: isOver ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </div>
  );
}

export default function BoardPage() {
  const { workspaceId, boardId } = useParams<{
    workspaceId: string;
    boardId: string;
  }>();

  const { data: tasks, isLoading } = useTasks(boardId);
  const { data: workspaces } = useWorkspaces();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();
  const statusMutation = useUpdateTaskStatus(boardId);

  useWorkspaceRealtime(workspaceId, boardId);

  const sensors = useSensors(
    // A small drag threshold so clicks still open the task modal.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const workspace = (workspaces as Workspace[] | undefined)?.find(
    (w) => w.id === workspaceId,
  );
  const members = workspace?.members || [];

  const grouped = useMemo(() => {
    const list = (tasks as Task[] | undefined) ?? [];
    const q = search.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description ?? "").toLowerCase().includes(q),
        )
      : list;

    return filtered.reduce<Record<TaskStatus, Task[]>>((acc, t) => {
      acc[t.status].push(t);
      return acc;
    }, EMPTY_GROUPS());
  }, [tasks, search]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;

    const task = (tasks as Task[] | undefined)?.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistically move the card, then persist.
    queryClient.setQueryData<Task[]>(["tasks", boardId], (old) =>
      old?.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    statusMutation.mutate({ taskId, status: newStatus });
  };

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
      <div className="shrink-0 anim-fade-up rounded-2xl p-5 glass-panel">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Board view
        </p>
        <div className="flex flex-wrap items-center gap-4">
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

          <div className="ml-auto sidebar-search" style={{ maxWidth: 240 }}>
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-3)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
            />
          </div>
        </div>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-5 overflow-x-auto pb-4 flex-1 items-start anim-fade-up d2">
          {COLUMNS.map((col) => {
            const colTasks = grouped[col.status];
            return (
              <DroppableColumn key={col.status} status={col.status}>
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
                      style={{ background: `${col.color}18`, color: col.color }}
                    >
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {colTasks.map((task) => (
                    <DraggableCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}
                </div>

                <CreateTaskModal
                  boardId={boardId}
                  workspaceId={workspaceId}
                  defaultStatus={col.status}
                  members={members}
                />
              </DroppableColumn>
            );
          })}
        </div>
      </DndContext>

      {selectedTask &&
        (() => {
          // Reflect the freshest copy of the task (edits, comments, realtime).
          const liveTask =
            (tasks as Task[] | undefined)?.find((t) => t.id === selectedTask.id) ??
            selectedTask;
          return (
            <TaskDetailModal
              task={liveTask}
              boardId={boardId}
              workspaceId={workspaceId}
              members={members}
              open
              onClose={() => setSelectedTask(null)}
            />
          );
        })()}
    </div>
  );
}
