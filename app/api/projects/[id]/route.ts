import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { getFilePreview } from '@/lib/appwrite';
import { ExtendedSession } from '@/types';
import { Project, ProjectFile } from '@prisma/client';

type ProjectWithFiles = Project & {
    files: (ProjectFile & {
        uploadedBy: {
            id: string;
            name: string | null;
            email: string | null;
            image: string | null;
        };
    })[];
};

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession | null;
        const { id: projectId } = await Promise.resolve(params);

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { 
                files: {
                    include: {
                        uploadedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                }
            }
        }) as ProjectWithFiles | null;

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Add preview URLs to files
        const filesWithPreview = project.files.map(file => ({
            ...file,
            previewUrl: getFilePreview(file.appwriteId).toString()
        }));

        return NextResponse.json({
            ...project,
            files: filesWithPreview
        });
    } catch (error) {
        console.error('[PROJECT_DETAIL]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions) as ExtendedSession | null;
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find the project
        const project = await prisma.project.findUnique({
            where: { id: params.id },
        });
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Only allow owner or admin to delete
        const isOwner = project.ownerId === session.user.id;
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role!);
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete the project and its files (cascades in DB)
        await prisma.project.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[PROJECT_DELETE]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete project' },
            { status: 500 }
        );
    }
} 