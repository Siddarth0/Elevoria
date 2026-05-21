import Link from "next/link";
import Logo from "@/components/logo";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
  UsersRound,
} from "lucide-react";

const features = [
  {
    title: "Workspaces that stay organized",
    description: "Create focused spaces for teams, products, client work, or internal projects.",
    icon: LayoutDashboard,
    color: "var(--accent)",
  },
  {
    title: "Boards built for momentum",
    description: "Move tasks through clear stages so everyone can see what is next, blocked, or done.",
    icon: Clock3,
    color: "var(--accent-3)",
  },
  {
    title: "Comments beside the work",
    description: "Keep context, decisions, and follow-ups attached to the tasks they belong to.",
    icon: MessageSquareText,
    color: "var(--accent-2)",
  },
  {
    title: "AI-ready productivity",
    description: "Elevoria is shaped for smarter planning, summaries, and support as your workflow grows.",
    icon: Bot,
    color: "#9A8CFF",
  },
];

const boardColumns = [
  {
    title: "To Do",
    tasks: ["Design onboarding", "Invite workspace members"],
    color: "#A7B5B4",
  },
  {
    title: "In Progress",
    tasks: ["Build project dashboard", "Draft sprint plan"],
    color: "#42D4C8",
  },
  {
    title: "Review",
    tasks: ["Polish task detail modal"],
    color: "#F4C95D",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo href="/" size="md" />
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:pb-24 lg:pt-16">
        <div className="anim-fade-up">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered productivity platform
          </div>

          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl" style={{ color: "var(--text)" }}>
            Turn scattered work into a calm, visible flow.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 sm:text-lg" style={{ color: "var(--text-2)" }}>
            Elevoria helps teams plan projects, manage boards, assign tasks, and keep conversations close to the work that matters.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary">
              Create your workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-ghost">
              Sign in to dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3" style={{ color: "var(--text-2)" }}>
            {["Workspace boards", "Task comments", "Team roles"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: "var(--accent)" }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="anim-fade-up d2 relative">
          <div
            className="absolute -left-8 top-12 h-32 w-32 rounded-full blur-3xl"
            style={{ background: "rgba(66,212,200,0.22)" }}
          />
          <div
            className="absolute -right-5 bottom-12 h-36 w-36 rounded-full blur-3xl"
            style={{ background: "rgba(255,138,91,0.16)" }}
          />

          <div className="glass-panel relative rounded-2xl p-4 shadow-2xl sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  Product Sprint
                </p>
                <h2 className="mt-1 text-xl font-extrabold" style={{ color: "var(--text)" }}>
                  Launch board
                </h2>
              </div>
              <div className="flex -space-x-2">
                {["AK", "JS", "MR"].map((person, index) => (
                  <div
                    key={person}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 text-[11px] font-extrabold"
                    style={{
                      background: ["var(--accent)", "var(--accent-2)", "var(--accent-3)"][index],
                      borderColor: "var(--surface)",
                      color: "#071312",
                    }}
                  >
                    {person}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {boardColumns.map((column) => (
                <div
                  key={column.title}
                  className="rounded-2xl p-3"
                  style={{ background: "rgba(255,255,255,0.035)", border: "1px solid var(--border)" }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: column.color }} />
                    <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                      {column.title}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {column.tasks.map((task) => (
                      <div key={task} className="card p-3">
                        <p className="text-sm font-bold leading-snug" style={{ color: "var(--text)" }}>
                          {task}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: `${column.color}20`, color: column.color }}
                          >
                            Active
                          </span>
                          <MessageSquareText className="h-4 w-4" style={{ color: "var(--text-3)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Features
            </p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: "var(--text)" }}>
              A cleaner home for team execution.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7" style={{ color: "var(--text-2)" }}>
            Designed for project teams that need clarity without turning their workspace into a maze.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div key={feature.title} className="card p-5 anim-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <div
                className="mb-5 grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `${feature.color}1F`, color: feature.color }}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold" style={{ color: "var(--text)" }}>
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--text-2)" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        <div className="glass-panel flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <div
              className="grid h-12 w-12 place-items-center rounded-xl"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
            >
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>
                Ready to organize your team?
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-2)" }}>
                Create an account and start building your first workspace.
              </p>
            </div>
          </div>
          <Link href="/register" className="btn-primary">
            Start now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
