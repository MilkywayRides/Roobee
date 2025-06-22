import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projectId = "46f3cfac-67fe-480e-91cf-fcbef4909de0";
    
    console.log('Testing project ID:', projectId);
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        files: {
          orderBy: { fileName: 'asc' }
        },
        owner: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ 
        error: 'Project not found',
        projectId,
        exists: false
      });
    }

    return NextResponse.json({
      exists: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        owner: project.owner,
        filesCount: project.files.length,
        files: project.files.map(f => ({
          id: f.id,
          fileName: f.fileName,
          fileSize: f.fileSize,
          appwriteId: f.appwriteId
        }))
      }
    });
  } catch (error) {
    console.error('Error testing project:', error);
    return NextResponse.json({ 
      error: 'Failed to test project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 