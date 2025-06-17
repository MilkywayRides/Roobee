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
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Mail } from "lucide-react";
import { UserProfile } from "./user-profile";

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
          ${collapsed ? 'w-12' : 'w-64'} flex flex-col
          bg-background dark:bg-[#171717] dark:text-white ${className || ''}`
        }
        style={{ minHeight: '100vh' }}
      >
        <div className="flex h-14 items-center px-4">
          <Shield className="h-6 w-6" />
          {!collapsed && (
            <div className="ml-2 leading-tight">
              <span className="block text-lg font-semibold">Admin</span>
              <span className="block text-xs text-muted-foreground">Enterprise</span>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-2 px-2 py-2">
            {/* Quick Create button */}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size={collapsed ? "icon" : "sm"}
                  className={cn("group", !collapsed && "flex-1")}
                >
                  <Plus className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">Quick Create</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Quick Create</TooltipContent>}
            </Tooltip>

            {/* Inbox button */}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Inbox</span>
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Inbox</TooltipContent>}
            </Tooltip>
          </div>
          
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
        <UserProfile user={session?.user || null} collapsed={collapsed} />
      </div>
    </TooltipProvider>
  );
} 