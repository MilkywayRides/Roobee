import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/config/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, coins } = await request.json()

    // Mock Stripe payment intent for demo
    const paymentIntent = {
      client_secret: 'pi_mock_' + Math.random().toString(36).substr(2, 9),
      id: 'pi_' + Math.random().toString(36).substr(2, 9)
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}