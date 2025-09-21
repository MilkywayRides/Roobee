import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/config/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { owner: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only project owner can sync repository' }, { status: 403 })
    }

    if (!project.githubRepo) {
      return NextResponse.json({ error: 'No GitHub repository linked' }, { status: 400 })
    }

    const repoMatch = project.githubRepo.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!repoMatch) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 })
    }

    const [, owner, repo] = repoMatch
    const repoName = repo.replace('.git', '')

    const githubToken = process.env.GITHUB_TOKEN
    
    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 })
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Blaze-Neuro-App'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch repository' }, { status: response.status })
    }

    const contents = await response.json()
    
    const processedFiles = await Promise.all(
      contents.map(async (item: any) => {
        if (item.type === 'file' && item.download_url) {
          try {
            const fileResponse = await fetch(item.download_url)
            const fileContent = await fileResponse.text()
            
            const fileName = `${id}/${item.path}`
            const { data, error } = await supabase.storage
              .from('repositories')
              .upload(fileName, fileContent, {
                contentType: 'text/plain',
                upsert: true
              })

            if (error) {
              console.error('Supabase upload error:', error)
              return null
            }

            return {
              name: item.name,
              path: item.path,
              type: item.type,
              size: item.size,
              storageUrl: data.path
            }
          } catch (error) {
            console.error('Error processing file:', item.name, error)
            return null
          }
        }
        
        return {
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size || 0
        }
      })
    )

    const validFiles = processedFiles.filter(Boolean)

    await prisma.repositoryCache.upsert({
      where: { projectId: id },
      update: {
        files: validFiles,
        lastSync: new Date()
      },
      create: {
        projectId: id,
        owner,
        repo: repoName,
        isPrivate: true,
        files: validFiles
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Repository synced successfully',
      filesCount: validFiles.length
    })

  } catch (error) {
    console.error('Error syncing repository:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}