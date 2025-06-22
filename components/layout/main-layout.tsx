import { Navbar } from "@/components/navbar";

interface MainLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

export function MainLayout({ children, showNavbar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </div>
  );
} 