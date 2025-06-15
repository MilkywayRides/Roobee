import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import ProjectView from './ProjectView';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      files: {
        orderBy: { fileName: 'asc' }
      }
    }
  });

  if (!project) {
    notFound();
  }

  return <ProjectView project={project} />;
} 