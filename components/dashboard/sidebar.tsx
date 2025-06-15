"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  User,
  Shield,
  Moon,
  Sun,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: FileText,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((c: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean | ((o: boolean) => boolean)) => void;
}

export function Sidebar({ className, collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    try {
      await fetch("/api/user/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  return (
    <TooltipProvider>
      {/* Desktop sidebar: always visible on md+, mobile: overlay when open, with animation */}
      <div
        className={
          `z-50 fixed md:static top-0 left-0 h-full
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${collapsed ? 'w-20' : 'w-64'} flex flex-col
          bg-background dark:bg-[#171717] dark:text-white ${className || ''}`
        }
        style={{ minHeight: '100vh' }}
      >
        <div className="flex h-14 items-center px-4">
          <Shield className="h-6 w-6" />
          {!collapsed && <span className="ml-2 text-lg font-semibold">Admin</span>}
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const btn = (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive ? "dark:bg-secondary/50" : "dark:hover:bg-muted/50",
                    collapsed ? "px-2" : ""
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span className="ml-2">{item.name}</span>}
                  </Link>
                </Button>
              );
              return collapsed ? (
                <Tooltip key={item.name} delayDuration={100}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="select-none">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              ) : (
                btn
              );
            })}
          </div>
        </ScrollArea>
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start dark:text-white">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                {!collapsed && <span className="ml-2">{session?.user?.name || "User"}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleThemeChange("light")}> <Sun className="mr-2 h-4 w-4" /> Light </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("dark")}> <Moon className="mr-2 h-4 w-4" /> Dark </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("system")}> <Monitor className="mr-2 h-4 w-4" /> System </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}> <LogOut className="mr-2 h-4 w-4" /> Sign out </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
} 