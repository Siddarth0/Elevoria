import ProtectedRoute from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <aside className="w-64 border-r p-4">
          <h1 className="font-bold text-xl">
            Elevoria
          </h1>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
