export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r p-4">
        <h1 className="font-bold text-xl">Elevoria</h1>
        <nav className="mt-6 space-y-2">
          <p>Workspaces</p>
          <p>Boards</p>
          <p>AI Tools</p>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
