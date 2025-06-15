import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { getFileDownload } from '@/lib/appwrite';
import { ExtendedSession } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { appwriteId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the file in the database
    const file = await prisma.projectFile.findUnique({
      where: {
        appwriteId: params.appwriteId
      },
      include: {
        project: true
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if user has access to the file
    if (!file.isPublic && !file.project.isFree) {
      // TODO: Check if user has purchased the project
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the file download URL from Appwrite
    const downloadUrl = getFileDownload(params.appwriteId).toString();

    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download file' },
      { status: 500 }
    );
  }
} 