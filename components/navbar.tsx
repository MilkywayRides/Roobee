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
import {
  Menu,
  X,
  Code,
  FileText,
  User,
  LogOut,
  Shield,
  Settings,
  Github,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ProfileDropdown } from "@/components/profile/profile-dropdown";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Posts", href: "/posts" },
  { name: "Terminal", href: "/terminal" },
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
                Roobee.
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

            {/* GitHub Link */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="https://github.com/yourusername" target="_blank">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>

            {/* User Menu */}
            {session?.user ? (
              <div className="flex items-center space-x-4">
                {/* Admin Badge */}
                {(session.user as any)?.role === "ADMIN" || (session.user as any)?.role === "SUPER_ADMIN" ? (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                ) : null}
                
                {/* Profile Dropdown */}
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
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name === "Projects" && <Code className="h-4 w-4" />}
                        {item.name === "Posts" && <FileText className="h-4 w-4" />}
                        {item.name === "Terminal" && <Code className="h-4 w-4" />}
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  <Separator />

                  {/* Mobile User Section */}
                  {session?.user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                          <AvatarFallback>
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                        {(session.user as any)?.role === "ADMIN" || (session.user as any)?.role === "SUPER_ADMIN" ? (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        ) : null}
                      </div>
                      
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </Button>
                        {(session.user as any)?.role === "ADMIN" || (session.user as any)?.role === "SUPER_ADMIN" ? (
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </Button>
                        ) : null}
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-red-600 hover:text-red-600"
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
                    <div className="space-y-2">
                      <Button className="w-full" asChild>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  )}

                  <Separator />

                  {/* GitHub Link for Mobile */}
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="https://github.com/yourusername" target="_blank">
                      <Github className="mr-2 h-4 w-4" />
                      View on GitHub
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 