'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CreditCard, Smartphone, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import confetti from 'canvas-confetti'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = {
  starter: { coins: 50, price: 499, name: 'Starter Pack' },
  pro: { coins: 150, price: 999, name: 'Pro Pack' },
  premium: { coins: 500, price: 2999, name: 'Premium Pack' }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

function StripePaymentForm({ plan, onSuccess }: { plan: any, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    const cardElement = elements.getElement(CardElement)
    
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement!,
    })

    if (!error) {
      setTimeout(() => {
        setLoading(false)
        onSuccess()
      }, 2000)
    } else {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
          },
        }} />
      </div>
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? 'Processing...' : `Pay ₹${plan.price}`}
      </Button>
    </form>
  )
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('gateway')
  const [selectedGateway, setSelectedGateway] = useState('')
  const [loading, setLoading] = useState(false)
  
  const planId = params.planId as keyof typeof plans
  const plan = plans[planId]

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (!plan) {
    return <div>Plan not found</div>
  }

  const handleRazorpayPayment = () => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: plan.price * 100,
      currency: 'INR',
      name: 'Blaze Neuro',
      description: `${plan.name} - ${plan.coins} Coins`,
      handler: function (response: any) {
        handlePaymentSuccess()
      },
      prefill: {
        name: session?.user?.name,
        email: session?.user?.email,
      },
      theme: {
        color: '#000000'
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const handlePaymentSuccess = async () => {
    setLoading(true)
    
    const response = await fetch('/api/user/coins/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coins: plan.coins })
    })

    if (response.ok) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      setActiveTab('success')
    }
    
    setLoading(false)
  }

  const handleGatewayNext = () => {
    if (selectedGateway) {
      setActiveTab('payment')
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Complete Your Purchase</span>
              <Badge variant="secondary">{plan.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{plan.coins} Coins</h3>
                  <p className="text-sm text-gray-600">One-time purchase</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹{plan.price}</p>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gateway" disabled={activeTab === 'success'}>
                  1. Gateway
                </TabsTrigger>
                <TabsTrigger value="payment" disabled={!selectedGateway || activeTab === 'success'}>
                  2. Payment
                </TabsTrigger>
                <TabsTrigger value="success" disabled={activeTab !== 'success'}>
                  3. Complete
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gateway" className="space-y-4">
                <h3 className="text-lg font-semibold">Select Payment Gateway</h3>
                <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex items-center cursor-pointer flex-1">
                      <Smartphone className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium">Razorpay</p>
                        <p className="text-sm text-muted-foreground">UPI, Cards, Net Banking, Wallets</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 mr-3 text-purple-600" />
                      <div>
                        <p className="font-medium">Stripe</p>
                        <p className="text-sm text-muted-foreground">Credit/Debit Cards, Payment Links</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                <Button 
                  onClick={handleGatewayNext} 
                  disabled={!selectedGateway}
                  className="w-full"
                >
                  Continue to Payment
                </Button>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <h3 className="text-lg font-semibold">Complete Payment</h3>
                
                {selectedGateway === 'razorpay' && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        You will be redirected to Razorpay's secure payment gateway
                      </p>
                    </div>
                    <Button 
                      onClick={handleRazorpayPayment}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Processing...' : 'Pay with Razorpay'}
                    </Button>
                  </div>
                )}

                {selectedGateway === 'stripe' && (
                  <Elements stripe={stripePromise}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Card Details</Label>
                        <StripePaymentForm plan={plan} onSuccess={handlePaymentSuccess} />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label>Or pay with Payment Link</Label>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setTimeout(handlePaymentSuccess, 2000)
                          }}
                        >
                          Generate Payment Link
                        </Button>
                      </div>
                    </div>
                  </Elements>
                )}
              </TabsContent>

              <TabsContent value="success" className="space-y-6 text-center">
                <div className="space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-green-600">Payment Successful!</h3>
                  <p className="text-gray-600">
                    {plan.coins} coins have been added to your account
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Coins Added:</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">+{plan.coins}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/projects')}
                    className="w-full"
                  >
                    Browse Projects
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/upgrade')}
                    className="w-full"
                  >
                    Buy More Coins
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}