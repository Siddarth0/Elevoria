import { Task, TaskPriority } from "@/types/task";
import { Calendar, Link2, MessageSquare, MoreHorizontal } from "lucide-react";

const PRIORITY: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  LOW: { label: "Low", color: "#4D9170", bg: "rgba(77,145,112,0.14)" },
  MEDIUM: { label: "Medium", color: "#C49A4A", bg: "rgba(196,154,74,0.14)" },
  HIGH: { label: "High", color: "#C66B4E", bg: "rgba(198,107,78,0.14)" },
  URGENT: { label: "Urgent", color: "#C6524A", bg: "rgba(198,82,74,0.14)" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function AvatarCluster({ task }: { task: Task }) {
  const people = [task.creator];
  if (task.assignee && task.assignee.id !== task.creator.id) {
    people.push(task.assignee);
  }

  const colors = ["#7AA28B", "#C8795A", "#D0AD57", "#8B9694"];

  return (
    <div className="flex -space-x-1.5">
      {people.slice(0, 3).map((p, i) => (
        <div
          key={p.id}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 shrink-0"
          style={{
            background: colors[i % colors.length],
            borderColor: "var(--surface)",
            color: "#fff",
            zIndex: people.length - i,
          }}
          title={p.fullName}
        >
          {initials(p.fullName)}
        </div>
      ))}
      {people.length > 3 && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
          style={{
            background: "var(--elevated)",
            borderColor: "var(--surface)",
            color: "var(--text-2)",
          }}
        >
          +{people.length - 3}
        </div>
      )}
    </div>
  );
}

export default function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const p = PRIORITY[task.priority];

  return (
    <div
      onClick={onClick}
      className="card p-4 cursor-pointer group relative overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 h-full w-1 opacity-80"
        style={{ background: p.color }}
      />
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: p.bg, color: p.color }}
        >
          {p.label}
        </span>

        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <span
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium"
              style={{
                background: "var(--elevated)",
                color: "var(--text-3)",
                border: "1px solid var(--border)",
              }}
            >
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-3)" }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <p
        className="font-semibold text-sm leading-snug mb-1.5"
        style={{ color: "var(--text)" }}
      >
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p
          className="text-xs leading-relaxed line-clamp-2 mb-3"
          style={{ color: "var(--text-2)" }}
        >
          {task.description}
        </p>
      )}

      {/* Bottom */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <AvatarCluster task={task} />

        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1 text-[11px] font-medium"
            style={{ color: "var(--text-3)" }}
          >
            <Link2 className="w-3 h-3" />
            {task.attachments?.length ?? 0}
          </span>
          <span
            className="flex items-center gap-1 text-[11px] font-medium"
            style={{ color: "var(--text-3)" }}
          >
            <MessageSquare className="w-3 h-3" />
            {task.comments?.length ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
