import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { getFilePreview } from "@/lib/appwrite";
import { ExtendedSession } from "@/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, fileId, fileSize, mimeType, isPublic } = await req.json();

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id
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
        projectId: params.id,
        fileName,
        appwriteId: fileId,
        fileSize,
        mimeType,
        fileUrl,
        isPublic,
        uploadedById: session.user.id
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
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