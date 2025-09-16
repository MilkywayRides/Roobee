"use client";

import React, { useState, useEffect } from "react";
import { FileText, Calendar, Search, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils"; // Your path to utils

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

// Interface definitions
interface Post {
    id: string;
    title: string;
    date: string;
    excerpt?: string;
    category?: string;
}

interface PostSidebarProps {
    posts: Post[];
    currentPostId?: string;
    onPostSelect?: (postId: string) => void;
    loading?: boolean;
}

// Reusable component for the sidebar's content
const SidebarContent: React.FC<PostSidebarProps> = ({
    posts,
    currentPostId,
    onPostSelect,
    loading = false,
}) => {
    const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    useEffect(() => {
        let filtered = posts;
        if (searchTerm) {
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory !== "all") {
            filtered = filtered.filter((post) => post.category === selectedCategory);
        }
        setFilteredPosts(filtered);
    }, [posts, searchTerm, selectedCategory]);

    const categories = ["all", ...Array.from(new Set(posts.map((post) => post.category)))];

    const handlePostClick = (postId: string) => {
        if (onPostSelect) {
            onPostSelect(postId);
        } else {
            // Fallback for standalone usage
            window.location.href = `/posts/${postId}`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="flex flex-col h-full bg-card">
            {/* Header & Filters */}
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>All Posts</span>
                </h2>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <ScrollArea className="flex-grow">
                <div className="p-4">
                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No Posts Found</p>
                            <p className="text-sm">Try adjusting your search or filter.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredPosts.map((post) => (
                                <button
                                    key={post.id}
                                    onClick={() => handlePostClick(post.id)}
                                    className={cn(
                                        "w-full text-left group p-2 rounded-lg border transition-all duration-200",
                                        "hover:shadow-md hover:border-primary/50 hover:bg-muted/50",
                                        currentPostId === post.id
                                            ? "bg-primary/5 border-primary shadow-sm"
                                            : "bg-transparent border-border"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3
                                                className={cn(
                                                    "font-semibold leading-tight mb-2 group-hover:text-primary transition-colors",
                                                    currentPostId === post.id ? "text-primary" : "text-foreground"
                                                )}
                                            >
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                {post.category && (
                                                    <>
                                                        <span className="text-muted-foreground/50">·</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer Stats */}
            <div className="p-4 border-t mt-auto text-center">
                <p className="text-xs text-muted-foreground">
                    Showing <b>{filteredPosts.length}</b> of <b>{posts.length}</b> posts
                </p>
            </div>
        </div>
    );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
    <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3 mt-8">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
        </div>
    </div>
);

// Main responsive component
const PostSidebar: React.FC<PostSidebarProps> = (props) => {
    return (
        <>
            {/* Mobile View: Navbar with Sheet Trigger */}
            <header className="md:hidden fixed top-0 left-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 w-full">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <SidebarContent {...props} />
                    </SheetContent>
                </Sheet>
                <h1 className="font-semibold text-lg">Posts</h1>
            </header>

            {/* Desktop View: Sticky Sidebar */}
            <aside className="hidden md:block w-80 h-screen fixed top-0 left-0 z-20 border-r">
                <SidebarContent {...props} />
            </aside>
        </>
    );
};

export default PostSidebar;

