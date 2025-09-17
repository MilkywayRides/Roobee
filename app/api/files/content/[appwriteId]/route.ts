import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { getFileDownload } from '@/lib/appwrite';

import { ProjectFile, Project } from '@prisma/client';

// Cache file content for 5 minutes
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds

export async function GET(
  req: Request,
  context: { params: any }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appwriteId } = context.params;

    // Find the file in the database and include all needed fields
    const file = await prisma.projectFile.findFirst({
      where: { appwriteId },
      include: { project: true },
    }) as (ProjectFile & { project: Project }) | null;

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check access: allow if public or owner
    const isOwner = file.project.ownerId === userId;
    if (!file.isPublic && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the download URL from Appwrite
    const downloadUrl = getFileDownload(appwriteId).toString();

    // Fetch the content from the URL with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(downloadUrl, {
        signal: controller.signal,
        headers: {
          'Accept': file.mimeType || 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file content from Appwrite');
      }

      // Get the content as text
      const content = await response.text();

      // Set appropriate content type based on file extension
      const contentType = file.mimeType || 'text/plain';

      // Return the content with caching headers
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': `public, max-age=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
          'Content-Disposition': `inline; filename="${file.fileName}"`,
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('[FILE_CONTENT]', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Failed to fetch file content' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: any }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appwriteId } = context.params;
    const { content } = await req.json();

    // Find the file and check permissions
    const file = await prisma.projectFile.findFirst({
      where: { appwriteId },
      include: { project: true },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const isOwner = file.project.ownerId === userId;
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // TODO: Update the file content in your storage (Appwrite, S3, etc.)
    // Example for Appwrite:
    // await appwrite.storage.updateFileContent(appwriteId, content);

    // If you store file content in the DB, update it here:
    // await prisma.projectFile.update({
    //   where: { appwriteId },
    //   data: { content },
    // });

    // Respond with success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FILE_PATCH]', error);
    return NextResponse.json({ error: 'Failed to update file content' }, { status: 500 });
  }
} 