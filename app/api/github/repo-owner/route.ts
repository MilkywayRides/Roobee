import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/config/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const projectId = searchParams.get('projectId')

    if (!owner || !repo || !projectId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Get project owner's GitHub token
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Use environment GitHub token for private repo access
    const ownerToken = process.env.GITHUB_TOKEN

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${ownerToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Blaze-Neuro-App'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'GitHub API error' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('GitHub repo owner API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}