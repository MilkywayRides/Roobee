import { Sidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-end p-4 border-b">
          <ThemeToggle />
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 