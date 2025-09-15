"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Menu,
  Code,
  FileText,
  User,
  LogOut,
  Shield,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ProfileDropdown } from "@/components/profile/profile-dropdown";

const navigation = [
  { name: "Home", href: "/", icon: Code },
  { name: "Projects", href: "/projects", icon: Code },
  { name: "Posts", href: "/posts", icon: FileText },
  { name: "Terminal", href: "/terminal", icon: Code },
];

const userMenuItems = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Dashboard", href: "/dashboard", icon: Settings },
  { name: "Admin Dashboard", href: "/admin", icon: Shield, adminOnly: true },
];

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="hidden font-bold sm:inline-block">
                BlazeNeuro.
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            {session?.user ? (
              <div className="flex items-center space-x-4">
                {(session.user as any)?.role === "ADMIN" ||
                (session.user as any)?.role === "SUPER_ADMIN" ? (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                ) : null}

                <ProfileDropdown />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Theme Toggle for Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

              {/* Right-side mobile menu with blurred background */}
              <SheetContent
                side="right"
                className="w-full sm:max-w-md p-4 border-none bg-background/80 backdrop-blur-lg"
              >
                <Card className="rounded-xl shadow-lg border-none bg-background/90 backdrop-blur-md w-full h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg font-bold">Menu</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto space-y-6">
                    {/* Mobile Navigation */}
                    <div className="space-y-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>

                    <Separator />

                    {/* Mobile User Section */}
                    {session?.user ? (
                      <div className="space-y-4">
                        <Link
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-accent">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={session.user.image || ""}
                                alt={session.user.name || ""}
                              />
                              <AvatarFallback>
                                {session.user.name?.charAt(0).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="truncate text-sm font-medium">
                                {session.user.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {session.user.email}
                              </p>
                            </div>
                            {(session.user as any)?.role === "ADMIN" ||
                            (session.user as any)?.role === "SUPER_ADMIN" ? (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="mr-1 h-3 w-3" />
                                Admin
                              </Badge>
                            ) : null}
                          </div>
                        </Link>

                        <Separator />

                        <div className="space-y-1">
                          {userMenuItems.map((item) =>
                            item.adminOnly &&
                            (session.user as any)?.role !== "ADMIN" &&
                            (session.user as any)?.role !== "SUPER_ADMIN" ? null : (
                              <Button
                                key={item.name}
                                variant="ghost"
                                className="w-full justify-start text-sm"
                                asChild
                              >
                                <Link
                                  href={item.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <item.icon className="mr-2 h-4 w-4" />
                                  {item.name}
                                </Link>
                              </Button>
                            )
                          )}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => {
                              signOut();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button className="w-full" asChild>
                          <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Sign In
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link
                            href="/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Get Started
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
