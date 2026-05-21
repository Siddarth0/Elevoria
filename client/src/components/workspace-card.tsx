import { Workspace } from "@/types/workspace";
import Link from "next/link";

const ACCENT_COLORS = [
  "#7AA28B", "#C8795A", "#D0AD57", "#8B9694",
  "#9D8D68", "#6F8D83", "#A76F5B", "#879572",
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
        className="card p-5 cursor-pointer overflow-hidden relative min-h-38"
      >
        <div
          className="absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl opacity-70 transition-opacity group-hover:opacity-100"
          style={{ background: `${color}33` }}
        />
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-extrabold"
            style={{ background: `${color}1A`, color }}
          >
            {workspace.name[0].toUpperCase()}
          </div>
          <div className="h-7 rounded-full px-2.5 text-[11px] font-bold grid place-items-center" style={{ background: `${color}18`, color }}>
            Live
          </div>
        </div>

        <h2 className="font-bold text-base leading-snug" style={{ color: "var(--text)" }}>
          {workspace.name}
        </h2>

        <p
          className="text-xs mt-1 font-mono"
          style={{ color: "var(--text-3)", fontSize: "11px" }}
        >
          /{workspace.slug}
        </p>

        <p className="text-xs mt-5" style={{ color: "var(--text-3)" }}>
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
