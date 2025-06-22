import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { getFilePreview } from "@/lib/appwrite";

export async function POST(req: Request, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, fileId, fileSize, mimeType, isPublic } = await req.json();

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: context.params.id,
        ownerId: userId
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // Get file preview URL from Appwrite
    const fileUrl = getFilePreview(fileId).toString();

    // Create file record
    const createdFile = await prisma.projectFile.create({
      data: {
        projectId: context.params.id,
        fileName,
        appwriteId: fileId,
        fileSize,
        mimeType,
        fileUrl,
        isPublic,
        uploadedById: userId
      }
    });

    return NextResponse.json(createdFile);
  } catch (error) {
    console.error('Error creating file record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create file record' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const files = await prisma.projectFile.findMany({
      where: {
        projectId: id
      }
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch files' },
      { status: 500 }
    );
  }
} 