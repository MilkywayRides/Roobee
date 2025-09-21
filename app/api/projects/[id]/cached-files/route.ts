import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/config/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { 
        owner: true,
        purchases: {
          where: { userId: user.id }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const hasAccess = project.category === 'free' || 
                     project.ownerId === user.id || 
                     project.purchases.length > 0

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const cache = await prisma.repositoryCache.findUnique({
      where: { projectId: id }
    })

    if (!cache) {
      return NextResponse.json({ error: 'Repository not cached' }, { status: 404 })
    }

    return NextResponse.json({
      files: cache.files,
      lastSync: cache.lastSync,
      isPrivate: cache.isPrivate
    })

  } catch (error) {
    console.error('Error fetching cached files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const { filePath } = await request.json()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { 
        purchases: {
          where: { userId: user.id }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const hasAccess = project.category === 'free' || 
                     project.ownerId === user.id || 
                     project.purchases.length > 0

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const fileName = `${id}/${filePath}`
    const { data, error } = await supabase.storage
      .from('repositories')
      .download(fileName)

    if (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const content = await data.text()
    return NextResponse.json({ content })

  } catch (error) {
    console.error('Error fetching file content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}