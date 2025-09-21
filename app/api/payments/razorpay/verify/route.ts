import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/config/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, coins } = await request.json()

    // Mock verification for demo - in production, verify signature with Razorpay
    const isValid = razorpay_payment_id && razorpay_order_id

    if (isValid) {
      return NextResponse.json({ 
        success: true,
        verified: true 
      })
    } else {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}