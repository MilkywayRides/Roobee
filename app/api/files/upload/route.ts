import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/appwrite';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'File and project ID are required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    // Upload file to Appwrite
    const uploadedFile = await uploadFile(file);

    // Save file metadata to database
    const fileRecord = await prisma.projectFile.create({
      data: {
        fileName: file.name,
        appwriteId: uploadedFile.$id,
        fileSize: file.size,
        mimeType: file.type,
        isPublic,
        projectId,
        uploadedById: userId,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        isPublic: fileRecord.isPublic,
        appwriteId: fileRecord.appwriteId,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 