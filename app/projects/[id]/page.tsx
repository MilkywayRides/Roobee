import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import ProjectView from './ProjectView';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const projectId = params.id;
  if (!projectId) {
    notFound();
  }

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
    notFound();
  }

  return <ProjectView project={project} />;
} 