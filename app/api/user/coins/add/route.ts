import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/config/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { coins } = await request.json()

    if (!coins || coins <= 0) {
      return NextResponse.json({ error: 'Invalid coin amount' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        coin: {
          increment: coins
        }
      },
      select: { coin: true }
    })

    return NextResponse.json({ 
      success: true, 
      coins: updatedUser.coin,
      added: coins
    })
  } catch (error) {
    console.error('Error adding coins:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}