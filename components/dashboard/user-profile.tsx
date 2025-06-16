import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MoreVertical, Moon, Monitor, Sun } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

interface UserProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  collapsed?: boolean;
}

export function UserProfile({ user, collapsed = false }: UserProfileProps) {
  const { setTheme } = useTheme();

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
  };

  return (
    <div className="px-2 py-3">
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-13 px-2 justify-start rounded-md dark:text-white hover:bg-muted/50"
            >
              <div className="flex items-center">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="ml-2 flex flex-col items-start">
                    <span className="text-sm font-medium">{user.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                )}
                {!collapsed && <MoreVertical className="ml-2 h-4 w-4" />}
              </div>
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
            <DropdownMenuItem onClick={() => handleThemeChange("light")}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("system")}>
              <Monitor className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>


      </div>
    </div>
  );
} 