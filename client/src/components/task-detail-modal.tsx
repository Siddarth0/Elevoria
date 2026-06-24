"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useUpdateTaskStatus } from "@/hooks/use-update-task-status";
import { useAddComment } from "@/hooks/use-add-comment";
import { useGenerateSubtasks, useSuggestDeadline } from "@/hooks/use-ai-tools";
import { useAssignTask } from "@/hooks/use-assign-task";
import { useAttachFile } from "@/hooks/use-attach-file";
import {
  useUpdateTask,
  useDeleteTask,
  useDeleteComment,
  useDeleteAttachment,
} from "@/hooks/use-task-mutations";
import type {
  DeadlineResult,
  SubtasksResult,
} from "@/services/ai.service";
import { WorkspaceMember } from "@/types/workspace";
import { X, Calendar, User, Flag, MessageSquare, Send, Paperclip, Upload, Bot, CalendarClock, ListChecks, Pencil, Trash2, Check } from "lucide-react";

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "TODO",        label: "To Do",       color: "#8B9694" },
  { value: "IN_PROGRESS", label: "In Progress",  color: "#4D9170" },
  { value: "REVIEW",      label: "In Review",    color: "#C49A4A" },
  { value: "COMPLETED",   label: "Completed",    color: "#6F9D72" },
];

const PRIORITY: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  LOW:    { label: "Low",    color: "#4D9170", bg: "rgba(77,145,112,0.14)"  },
  MEDIUM: { label: "Medium", color: "#C49A4A", bg: "rgba(196,154,74,0.14)"  },
  HIGH:   { label: "High",   color: "#C66B4E", bg: "rgba(198,107,78,0.14)"   },
  URGENT: { label: "Urgent", color: "#C6524A", bg: "rgba(198,82,74,0.14)"   },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function TaskDetailModal({
  task,
  boardId,
  workspaceId,
  members,
  open,
  onClose,
}: {
  task: Task;
  boardId: string;
  workspaceId: string;
  members: WorkspaceMember[];
  open: boolean;
  onClose: () => void;
}) {
  const [commentText, setCommentText] = useState("");

  const statusMutation = useUpdateTaskStatus(boardId);
  const commentMutation = useAddComment(boardId);
  const assignMutation = useAssignTask(boardId);
  const attachMutation = useAttachFile(boardId);
  const updateMutation = useUpdateTask(boardId);
  const deleteMutation = useDeleteTask(boardId);
  const deleteCommentMutation = useDeleteComment(boardId);
  const deleteAttachmentMutation = useDeleteAttachment(boardId);
  const subtasksMutation = useGenerateSubtasks();
  const deadlineMutation = useSuggestDeadline();
  const [aiSubtasks, setAiSubtasks] = useState<SubtasksResult | null>(null);
  const [aiDeadline, setAiDeadline] = useState<DeadlineResult | null>(null);
  const [aiError, setAiError] = useState("");

  // Inline edit state for the task's core fields.
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? "");
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : "",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startEditing = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setEditing(true);
  };

  const saveEdits = async () => {
    if (!editTitle.trim()) return;
    await updateMutation.mutateAsync({
      taskId: task.id,
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      priority: editPriority,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
    });
    setEditing(false);
  };

  const handleDeleteTask = async () => {
    await deleteMutation.mutateAsync(task.id);
    onClose();
  };

  const handleStatusChange = (status: TaskStatus) =>
    statusMutation.mutate({ taskId: task.id, status });

  const handleAssigneeChange = (assigneeId: string) => {
    if (!assigneeId || assigneeId === task.assignee?.id) return;
    assignMutation.mutate({ taskId: task.id, assigneeId });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await commentMutation.mutateAsync({ taskId: task.id, content: commentText.trim() });
    setCommentText("");
  };

  const handleFileChange = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    await attachMutation.mutateAsync({
      taskId: task.id,
      files: Array.from(fileList),
    });
  };

  const generateAiSubtasks = async () => {
    setAiError("");
    try {
      const result = await subtasksMutation.mutateAsync({
        workspaceId,
        taskId: task.id,
      });
      setAiSubtasks(result);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setAiError(err.response?.data?.message || "Could not draft subtasks.");
    }
  };

  const generateAiDeadline = async () => {
    setAiError("");
    try {
      const result = await deadlineMutation.mutateAsync({
        workspaceId,
        taskId: task.id,
      });
      setAiDeadline(result);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setAiError(err.response?.data?.message || "Could not suggest a deadline.");
    }
  };

  const priority = PRIORITY[task.priority];

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 anim-fade-in"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
        />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[min(94vw,38rem)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl flex flex-col anim-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-md)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-start gap-4 p-6"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="label">Title</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="field"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="field"
                      style={{ resize: "vertical" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                        className="field"
                        style={{ padding: "0.5rem 0.7rem", fontSize: "0.8125rem" }}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Due date</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="field"
                        style={{ padding: "0.5rem 0.7rem", fontSize: "0.8125rem" }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdits}
                      disabled={updateMutation.isPending || !editTitle.trim()}
                      className="btn-primary px-3.5"
                    >
                      <Check className="w-4 h-4" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-ghost">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: priority.bg, color: priority.color }}
                    >
                      {priority.label}
                    </span>
                  </div>
                  <Dialog.Title
                    className="font-bold text-lg leading-snug"
                    style={{ color: "var(--text)" }}
                  >
                    {task.title}
                  </Dialog.Title>
                  {task.description && (
                    <p
                      className="text-sm mt-2 leading-relaxed"
                      style={{ color: "var(--text-2)" }}
                    >
                      {task.description}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!editing && (
                <>
                  <button
                    onClick={startEditing}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: "var(--elevated)", color: "var(--text-3)" }}
                    title="Edit task"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: "var(--elevated)", color: "#F0A09A" }}
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <Dialog.Close asChild>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: "var(--elevated)", color: "var(--text-3)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {confirmDelete && (
              <div
                className="rounded-xl p-4 flex items-center justify-between gap-3"
                style={{ background: "rgba(198,82,74,0.1)", border: "1px solid rgba(198,82,74,0.25)" }}
              >
                <p className="text-sm" style={{ color: "#F0A09A" }}>
                  Delete this task permanently?
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleDeleteTask}
                    disabled={deleteMutation.isPending}
                    className="btn-primary px-3 py-1.5 text-xs"
                    style={{ background: "#C6524A" }}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="btn-ghost px-3 py-1.5 text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-3"
                style={{ color: "var(--text-3)" }}
              >
                Status
              </p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((s) => {
                  const active = task.status === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      disabled={statusMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                      style={{
                        background: active ? `${s.color}1A` : "var(--elevated)",
                        border: `1px solid ${active ? s.color + "55" : "var(--border)"}`,
                        color: active ? s.color : "var(--text-3)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                  <User className="w-3 h-3" /> Assignee
                </p>
                {members.length > 0 ? (
                  <select
                    value={task.assignee?.id ?? ""}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    disabled={assignMutation.isPending}
                    className="field"
                    style={{ padding: "0.5rem 0.7rem", fontSize: "0.8125rem" }}
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                    {task.assignee ? task.assignee.fullName : "No member list available"}
                  </p>
                )}
              </div>

              {task.dueDate && (
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                    <Calendar className="w-3 h-3" /> Due
                  </p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                    {new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                  <Flag className="w-3 h-3" /> Priority
                </p>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: priority.bg, color: priority.color }}
                >
                  {priority.label}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                  <User className="w-3 h-3" /> Creator
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  {task.creator.fullName}
                </p>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(233,229,215,0.028)", border: "1px solid var(--border)" }}>
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4" style={{ color: "var(--accent)" }} />
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  AI planning
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={generateAiSubtasks}
                  disabled={subtasksMutation.isPending}
                  className="btn-ghost"
                >
                  <ListChecks className="h-4 w-4" />
                  {subtasksMutation.isPending ? "Thinking..." : "Draft subtasks"}
                </button>
                <button
                  type="button"
                  onClick={generateAiDeadline}
                  disabled={deadlineMutation.isPending}
                  className="btn-ghost"
                >
                  <CalendarClock className="h-4 w-4" />
                  {deadlineMutation.isPending ? "Estimating..." : "Suggest deadline"}
                </button>
              </div>
              {aiError && (
                <p className="mt-3 rounded-xl px-3 py-2 text-sm" style={{ background: "rgba(198,82,74,0.1)", color: "#F0A09A" }}>
                  {aiError}
                </p>
              )}
              {(aiSubtasks || aiDeadline) && (
                <div className="mt-4 space-y-4">
                  {aiSubtasks && aiSubtasks.items[0] && (
                    <div>
                      <p className="mb-2 text-xs font-bold" style={{ color: "var(--text)" }}>Subtasks</p>
                      {aiSubtasks.unavailable ? (
                        <p className="text-sm" style={{ color: "var(--text-2)" }}>
                          AI unavailable — try again in a moment.
                        </p>
                      ) : (
                        <ol className="ml-4 list-decimal space-y-1.5 text-sm leading-7" style={{ color: "var(--text-2)" }}>
                          {aiSubtasks.items[0].subtasks.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                  {aiDeadline && aiDeadline.items[0] && (
                    <div>
                      <p className="mb-2 text-xs font-bold" style={{ color: "var(--text)" }}>Deadline</p>
                      {aiDeadline.unavailable ? (
                        <p className="text-sm" style={{ color: "var(--text-2)" }}>
                          AI unavailable — try again in a moment.
                        </p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                          >
                            <CalendarClock className="h-3 w-3" />
                            {aiDeadline.items[0].suggestedDate}
                          </span>
                          {aiDeadline.items[0].reason && (
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                              {aiDeadline.items[0].reason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-4 flex items-center gap-1.5"
                style={{ color: "var(--text-3)" }}
              >
                <Paperclip className="w-3 h-3" />
                Attachments ({task.attachments.length})
              </p>

              <div className="space-y-2">
                {task.attachments.map((attachment) => {
                  const name = attachment.fileName ?? attachment.filename ?? "Attachment";
                  const url = attachment.fileUrl ?? attachment.url;

                  return (
                    <div
                      key={attachment.id}
                      className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                      style={{
                        background: "rgba(233,229,215,0.035)",
                        border: "1px solid var(--border)",
                        color: "var(--text-2)",
                      }}
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 truncate flex-1 min-w-0"
                      >
                        <Paperclip className="h-4 w-4 shrink-0" />
                        <span className="truncate">{name}</span>
                      </a>
                      <button
                        onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                        disabled={deleteAttachmentMutation.isPending}
                        className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "#F0A09A" }}
                        title="Delete attachment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}

                {task.attachments.length === 0 && (
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>No attachments yet.</p>
                )}
              </div>

              <label className="btn-ghost mt-3 w-full">
                <Upload className="h-4 w-4" />
                {attachMutation.isPending ? "Uploading..." : "Upload files"}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  disabled={attachMutation.isPending}
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </label>
            </div>

            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-4 flex items-center gap-1.5"
                style={{ color: "var(--text-3)" }}
              >
                <MessageSquare className="w-3 h-3" />
                Comments ({task.comments.length})
              </p>

              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="group flex gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: "var(--amber-mid)", color: "var(--amber)" }}
                    >
                      {initials(comment.user.fullName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                          {comment.user.fullName}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                          {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <button
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "#F0A09A" }}
                          title="Delete comment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                {task.comments.length === 0 && (
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>No comments yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Comment input */}
          <div className="flex gap-2 p-4" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment..."
              className="field flex-1"
              style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
            />
            <button
              onClick={handleAddComment}
              disabled={commentMutation.isPending || !commentText.trim()}
              className="btn-primary px-3.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
