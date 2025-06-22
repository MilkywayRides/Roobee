import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { ExtendedSession } from "@/types";

export async function GET() {
  try {
    console.log("[PROJECTS_PUBLIC] Fetching projects...");
    
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    let projects;
    
    if (!session?.user) {
      // Only show free projects to guests
      console.log("[PROJECTS_PUBLIC] Fetching free projects for guest user");
      projects = await prisma.project.findMany({
        where: { isFree: true },
        include: { 
          files: { 
            select: { id: true, fileName: true, fileSize: true, appwriteId: true } 
          } 
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Show all projects to signed-in users
      console.log("[PROJECTS_PUBLIC] Fetching all projects for authenticated user:", session.user.id);
      projects = await prisma.project.findMany({
        include: { 
          files: { 
            select: { id: true, fileName: true, fileSize: true, appwriteId: true } 
          } 
        },
        orderBy: { createdAt: "desc" },
      });
    }
    
    console.log("[PROJECTS_PUBLIC] Successfully fetched", projects.length, "projects");
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_PUBLIC] Error:", error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." }, 
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch projects" }, 
      { status: 500 }
    );
  }
} 