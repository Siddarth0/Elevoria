import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden" style={{ background: "transparent" }}>
        <Sidebar />
        <main className="flex-1 overflow-auto p-5 sm:p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
