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
    const path = searchParams.get('path')
    const projectId = searchParams.get('projectId')

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Owner and repo required' }, { status: 400 })
    }

    // Check if user is admin/root
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    let authToken = session.accessToken
    
    // For admin users or when accessing project repos, use project owner's token
    if (projectId || user?.role === 'ADMIN') {
      if (projectId) {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: { owner: true }
        })
        authToken = process.env.GITHUB_TOKEN
      } else {
        // Admin accessing without project context
        authToken = process.env.GITHUB_TOKEN
      }
    }
    
    if (!authToken) {
      return NextResponse.json({ error: 'No GitHub token available' }, { status: 401 })
    }

    const githubUrl = path 
      ? `https://api.github.com/repos/${owner}/${repo}/commits?path=${path}&per_page=1`
      : `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`

    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Blaze-Neuro-App'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`GitHub commits API error: ${response.status}`, errorText)
      return NextResponse.json({ error: 'Commits not accessible' }, { status: 404 })
    }

    const responseText = await response.text()
    
    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('Failed to parse commits response:', parseError)
      return NextResponse.json({ error: 'Invalid commits response' }, { status: 500 })
    }

  } catch (error) {
    console.error('GitHub commits API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}