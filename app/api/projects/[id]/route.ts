import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            isPublic: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            files: true,
          },
        },
      },
    });
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, category, price, githubRepo } = body;
    
    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }
    
    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Project description is required" },
        { status: 400 }
      );
    }
    
    if (!['free', 'paid', 'premium'].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }
    
    if (category !== 'free' && (!price || price <= 0)) {
      return NextResponse.json(
        { error: "Price must be greater than 0 for paid/premium projects" },
        { status: 400 }
      );
    }
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description.trim(),
        category,
        price: category === 'free' ? null : price,
        githubRepo: githubRepo?.trim() || null,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        files: true,
      },
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    // Delete the project (files will be cascade deleted due to schema)
    await prisma.project.delete({
      where: { id },
    });
    
    return NextResponse.json({ 
      message: "Project deleted successfully",
      deletedProject: {
        id: existingProject.id,
        name: existingProject.name,
        filesCount: existingProject.files.length,
      },
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}