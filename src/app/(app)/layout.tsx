import Sidebar from "@/components/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <div className="app-shell__sidebar">
        <Sidebar />
      </div>
      <main className="app-shell__main">
        {children}
      </main>
    </div>
  );
}
