import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import ProjectView from './ProjectView';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Import the buildFileTree function from ProjectView
function buildFileTree(files: any[]): any[] {
  const tree: { [key: string]: any } = {};
  const root: any[] = [];

  files.sort((a, b) => a.fileName.localeCompare(b.fileName));

  files.forEach(file => {
    const parts = file.fileName.split('/');
    if (parts.length > 1) {
      parts.shift();
    }

    let currentPath = '';
    let parentNode: any = null;

    parts.forEach((part: string, index: number) => {
      const isLastPart = index === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!tree[currentPath]) {
        const node = {
          name: part,
          path: currentPath,
          type: isLastPart ? 'file' : 'folder',
          size: isLastPart ? file.fileSize : 0,
          children: [],
          appwriteId: isLastPart ? file.appwriteId : undefined
        };

        tree[currentPath] = node;

        if (parentNode) {
          parentNode.children?.push(node);
        } else {
          root.push(node);
        }
      }

      parentNode = tree[currentPath];
    });
  });

  return root;
}

export default async function ProjectPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const { id: projectId } = await params;
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

  // Transform the project to match the expected interface
  const transformedProject = {
    ...project,
    description: project.description || '',
    owner: {
      name: project.owner.name || '',
      email: project.owner.email || '',
      image: project.owner.image || ''
    },
    files: buildFileTree(project.files)
  };

  return <ProjectView project={transformedProject} />;
} 