import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            files: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    });
    
    // Get total count for pagination
    const totalCount = await prisma.project.count({ where });
    
    return NextResponse.json({
      projects,
      totalCount,
      hasMore: limit && offset ? (parseInt(offset) + parseInt(limit)) < totalCount : false,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, price, githubRepo, ownerId } = body;
    
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
        { error: "Invalid category. Must be 'free', 'paid', or 'premium'" },
        { status: 400 }
      );
    }
    
    if (category !== 'free' && (!price || price <= 0)) {
      return NextResponse.json(
        { error: "Price must be greater than 0 for paid/premium projects" },
        { status: 400 }
      );
    }
    
    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 }
      );
    }
    
    // Check if owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });
    
    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      );
    }
    
    // Check for duplicate project names by the same owner
    const existingProject = await prisma.project.findFirst({
      where: {
        name: name.trim(),
        ownerId,
      },
    });
    
    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this name already exists" },
        { status: 409 }
      );
    }
    
    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        category,
        price: category === 'free' ? null : price,
        githubRepo: githubRepo?.trim() || null,
        ownerId,
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
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
