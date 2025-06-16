"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const segment = pathname.split('/').pop() || 'Dashboard';

  return (
    <div className="flex h-screen bg-background dark:bg-[#171717]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="flex-1 rounded-2xl overflow-auto">
        <div className="bg-card rounded-2xl shadow-lg m-1 min-h-screen">
          <div className="flex items-center justify-between rounded-t-2xl px-6 py-2 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-10">
            <div className="flex items-center">
              <button
                className="mr-4 p-2 rounded hover:bg-muted transition-colors hidden md:block"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? (
                  <svg width="13" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
                )}
              </button>
              <button
                className="mr-4 p-2 rounded hover:bg-muted transition-colors md:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {mobileOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
                )}
              </button>
              <div className="flex-1 text-lg font-semibold">
                {segment}
              </div>
            </div>
            <ThemeToggle />
          </div>
          <div className="p-6 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 