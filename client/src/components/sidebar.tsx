"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useBoards } from "@/hooks/use-boards";
import { Workspace } from "@/types/workspace";
import { Board } from "@/types/board";
import Logo from "@/components/logo";
import {
  Search, LayoutDashboard, ChevronDown, Plus,
  Archive, Trash2, Hash, LayoutGrid, Clock,
} from "lucide-react";

export default function Sidebar() {
  const { data } = useWorkspaces();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [recentOpen, setRecentOpen] = useState(true);

  const workspaces = (data as Workspace[]) || [];
  const filtered = search
    ? workspaces.filter((w) =>
        w.name.toLowerCase().includes(search.toLowerCase()),
      )
    : workspaces;

  const wsMatch = pathname.match(/\/workspace\/([^/]+)/);
  const activeWorkspaceId = wsMatch?.[1] ?? null;

  const boardMatch = pathname.match(/\/board\/([^/]+)/);
  const activeBoardId = boardMatch?.[1] ?? null;

  return (
    <aside
      className="flex flex-col h-full shrink-0 overflow-hidden"
      style={{
        width: 268,
        background: "rgba(15,19,23,0.84)",
        backdropFilter: "blur(18px)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 shrink-0">
        <Logo href="/dashboard" size="md" />
      </div>

      {/* Search */}
      <div className="px-3 pb-3 shrink-0">
        <div className="sidebar-search">
          <Search
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "var(--text-3)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
          <kbd
            className="text-[10px] rounded px-1.5 py-0.5 shrink-0"
            style={{
              color: "var(--text-3)",
              background: "var(--canvas)",
              border: "1px solid var(--border)",
              fontFamily: "inherit",
            }}
          >
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Nav */}
      <div className="px-2 pb-2 shrink-0">
        <SidebarNavLink
          href="/dashboard"
          active={pathname === "/dashboard"}
          icon={<LayoutDashboard className="w-4 h-4" />}
        >
          Dashboard
        </SidebarNavLink>
      </div>

      {/* Divider */}
      <div className="mx-3 shrink-0" style={{ height: 1, background: "var(--border)" }} />

      {/* Recent workspaces */}
      <div className="flex-1 overflow-y-auto pt-3 pb-2">
        <button
          onClick={() => setRecentOpen(!recentOpen)}
          className="flex items-center justify-between w-full px-4 py-1.5 transition-colors"
          style={{ color: "var(--text-3)", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase">
            <Clock className="w-3 h-3" />
            Recent
          </div>
          <ChevronDown
            className="w-3 h-3 transition-transform duration-200"
            style={{ transform: recentOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
        </button>

        {recentOpen && (
          <div className="px-2 mt-1 space-y-0.5">
            {filtered.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                workspace={workspace}
                isActive={workspace.id === activeWorkspaceId}
                activeBoardId={activeBoardId}
              />
            ))}

            {filtered.length === 0 && (
              <p
                className="px-3 py-2 text-xs"
                style={{ color: "var(--text-3)" }}
              >
                No workspaces found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom strip */}
      <div
        className="shrink-0 px-2 pt-3 pb-4 space-y-0.5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <SidebarNavLink
          href="/dashboard"
          active={false}
          icon={<Archive className="w-4 h-4" />}
        >
          Archive
        </SidebarNavLink>

        <SidebarNavLink
          href="/dashboard"
          active={false}
          icon={<Trash2 className="w-4 h-4" />}
        >
          Trash
        </SidebarNavLink>

        <div className="pt-2 px-1">
          <Link href="/dashboard">
            <button className="btn-primary w-full">
              <Plus className="w-4 h-4" />
              New Workspace
            </button>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function SidebarNavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
      style={{
        background: active ? "var(--amber-mid)" : "transparent",
        color: active ? "var(--text)" : "var(--text-2)",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "var(--elevated)";
          (e.currentTarget as HTMLElement).style.color = "var(--text)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
        }
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full"
          style={{ background: "var(--amber)" }}
        />
      )}
      <span style={{ color: active ? "var(--amber)" : undefined }}>{icon}</span>
      {children}
    </Link>
  );
}

function WorkspaceItem({
  workspace,
  isActive,
  activeBoardId,
}: {
  workspace: Workspace;
  isActive: boolean;
  activeBoardId: string | null;
}) {
  const { data: boards } = useBoards(isActive ? workspace.id : "");

  return (
    <div>
      <Link
        href={`/workspace/${workspace.id}`}
        className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150"
        style={{
          background: isActive ? "var(--amber-mid)" : "transparent",
          color: isActive ? "var(--text)" : "var(--text-2)",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = "var(--elevated)";
            (e.currentTarget as HTMLElement).style.color = "var(--text)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
          }
        }}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full"
            style={{ background: "var(--amber)" }}
          />
        )}

        <Hash
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: isActive ? "var(--amber)" : "var(--text-3)" }}
        />

        <span className="flex-1 truncate font-medium text-xs">
          {workspace.name}
        </span>

        {isActive && (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: "var(--amber)", color: "#fff" }}
          >
            {(boards as Board[] | undefined)?.length ?? 0}
          </span>
        )}
      </Link>

      {isActive && boards && (boards as Board[]).length > 0 && (
        <div
          className="ml-3 mt-0.5 mb-1 pl-3 space-y-0.5"
          style={{ borderLeft: "1px solid var(--border-md)" }}
        >
          {(boards as Board[]).map((board) => {
            const boardActive = activeBoardId === board.id;
            return (
              <Link
                key={board.id}
                href={`/workspace/${workspace.id}/board/${board.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-150"
                style={{
                  color: boardActive ? "var(--text)" : "var(--text-3)",
                  background: boardActive ? "var(--elevated)" : "transparent",
                  fontWeight: boardActive ? "600" : "400",
                }}
                onMouseEnter={(e) => {
                  if (!boardActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                    (e.currentTarget as HTMLElement).style.background = "var(--elevated)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!boardActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <LayoutGrid className="w-3 h-3 shrink-0" />
                <span className="truncate">{board.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
