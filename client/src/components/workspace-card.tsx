import { Workspace } from "@/types/workspace";
import Link from "next/link";

const ACCENT_COLORS = [
  "#7A70F0", "#22D1A8", "#F5A623", "#FF5252",
  "#4A86C8", "#FF6B9D", "#A78BFA", "#34D399",
];

function getColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return ACCENT_COLORS[Math.abs(h) % ACCENT_COLORS.length];
}

export default function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const color = getColor(workspace.name);

  return (
    <Link href={`/workspace/${workspace.id}`} className="block group">
      <div
        className="rounded-2xl p-5 transition-all duration-150 cursor-pointer"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "var(--elevated)";
          el.style.borderColor = "var(--border-md)";
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "var(--surface)";
          el.style.borderColor = "var(--border)";
          el.style.transform = "";
          el.style.boxShadow = "";
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold"
            style={{ background: `${color}1A`, color }}
          >
            {workspace.name[0].toUpperCase()}
          </div>
          <div className="w-2 h-2 rounded-full mt-1" style={{ background: color }} />
        </div>

        <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          {workspace.name}
        </h2>

        <p
          className="text-xs mt-1 font-mono"
          style={{ color: "var(--text-3)", fontSize: "11px" }}
        >
          /{workspace.slug}
        </p>

        <p className="text-xs mt-4" style={{ color: "var(--text-3)" }}>
          {new Date(workspace.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}
