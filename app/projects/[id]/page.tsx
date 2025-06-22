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

  // Filter out files without fileName and sort safely
  const validFiles = files.filter(file => file.fileName && typeof file.fileName === 'string');
  validFiles.sort((a, b) => (a.fileName || '').localeCompare(b.fileName || ''));

  validFiles.forEach(file => {
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
  try {
    const session = await getServerSession(authOptions);
    console.log('Session user:', (session?.user as any)?.id);
    
    if (!session?.user) {
      console.log('No session, redirecting to login');
      redirect('/login');
    }

    const { id: projectId } = await params;
    console.log('Project ID:', projectId);
    
    if (!projectId) {
      console.log('No project ID, showing not found');
      notFound();
    }

    console.log('Fetching project from database...');
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

    console.log('Project found:', !!project);
    console.log('Project files count:', project?.files?.length);
    console.log('Project name:', project?.name);
    console.log('Project owner:', project?.owner?.name);

    if (!project) {
      console.log('Project not found, showing not found');
      notFound();
    }

    console.log('Building file tree...');
    const fileTree = buildFileTree(project.files);
    console.log('File tree built, files count:', fileTree.length);

    // Transform the project to match the expected interface
    const transformedProject = {
      ...project,
      description: project.description || '',
      owner: {
        name: project.owner.name || '',
        email: project.owner.email || '',
        image: project.owner.image || ''
      },
      files: fileTree
    };

    console.log('Transformed project files count:', transformedProject.files.length);
    console.log('About to render ProjectView component...');

    // Simple fallback if ProjectView fails
    try {
      return <ProjectView project={transformedProject} />;
    } catch (error) {
      console.error('Error rendering ProjectView:', error);
      return (
        <div className="min-h-screen bg-background p-8">
          <h1 className="text-2xl font-bold mb-4">Project: {transformedProject.name}</h1>
          <p className="text-muted-foreground mb-4">{transformedProject.description}</p>
          <p className="text-sm">Owner: {transformedProject.owner.name}</p>
          <p className="text-sm">Files: {transformedProject.files.length}</p>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Files:</h2>
            {transformedProject.files.length > 0 ? (
              <ul className="space-y-1">
                {transformedProject.files.map((file, index) => (
                  <li key={index} className="text-sm">
                    {file.name} ({file.type})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No files found</p>
            )}
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error('Error in ProjectPage:', error);
    throw error;
  }
} 