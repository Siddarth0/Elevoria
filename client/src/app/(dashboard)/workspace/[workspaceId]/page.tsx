"use client";

import { useParams } from "next/navigation";
import { useBoards } from "@/hooks/use-boards";
import { useWorkspaces } from "@/hooks/use-workspaces";
import Link from "next/link";
import CreateBoardModal from "@/components/create-board-modal";
import { LayoutGrid, Users, Calendar } from "lucide-react";
import { Workspace } from "@/types/workspace";
import { Board } from "@/types/board";

const BOARD_COLORS = [
  "#D4A847", "#4A86C8", "#4A8B5E", "#C97B40",
  "#7B68B5", "#4A8B8B", "#B84F40", "#6B8B4A",
];

function getBoardColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return BOARD_COLORS[Math.abs(h) % BOARD_COLORS.length];
}

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data: boards, isLoading } = useBoards(workspaceId);
  const { data: workspaces } = useWorkspaces();

  const workspace = (workspaces as Workspace[] | undefined)?.find(
    (w) => w.id === workspaceId,
  );
  const members = workspace?.members || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded animate-pulse" style={{ background: "var(--elevated)" }} />
          <div className="h-9 w-48 rounded-xl animate-pulse" style={{ background: "var(--elevated)" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      </div>
    );
  }

  const boardList = (boards as Board[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between anim-fade-up">
        <div>
          <p
            className="text-xs font-medium tracking-widest uppercase mb-2"
            style={{ color: "var(--text-3)" }}
          >
            {workspace?.name ?? "Workspace"}
          </p>
          <h1
            className="leading-none"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontStyle: "italic",
              fontSize: "2.25rem",
              color: "var(--text)",
            }}
          >
            Boards
          </h1>
        </div>

        <div className="flex items-center gap-3 anim-fade-up d2">
          {members.length > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
              }}
            >
              <Users className="w-3.5 h-3.5" />
              {members.length} member{members.length !== 1 ? "s" : ""}
            </div>
          )}
          <CreateBoardModal workspaceId={workspaceId} />
        </div>
      </div>

      {boardList.length === 0 ? (
        <div
          className="rounded-2xl p-14 text-center anim-fade-up d2"
          style={{ border: "1px dashed var(--border-md)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--elevated)" }}
          >
            <LayoutGrid className="w-5 h-5" style={{ color: "var(--text-3)" }} />
          </div>
          <h2 className="font-semibold text-lg mb-1" style={{ color: "var(--text)" }}>
            No boards yet
          </h2>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Create your first kanban board to start tracking work.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {boardList.map((board, i) => {
            const color = getBoardColor(board.name);
            return (
              <div
                key={board.id}
                className="anim-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <Link
                  href={`/workspace/${workspaceId}/board/${board.id}`}
                  className="block"
                >
                  <div
                    className="rounded-2xl p-5 transition-all duration-200 cursor-pointer group"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderTop: `3px solid ${color}`,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "var(--elevated)";
                      el.style.transform = "translateY(-2px)";
                      el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "var(--surface)";
                      el.style.transform = "";
                      el.style.boxShadow = "";
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}18` }}
                      >
                        <LayoutGrid className="w-4 h-4" style={{ color }} />
                      </div>
                    </div>

                    <h2
                      className="font-semibold text-base leading-snug"
                      style={{ color: "var(--text)" }}
                    >
                      {board.name}
                    </h2>

                    <div
                      className="flex items-center gap-1.5 mt-3 text-[11px]"
                      style={{ color: "var(--text-3)" }}
                    >
                      <Calendar className="w-3 h-3" />
                      {new Date(board.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
