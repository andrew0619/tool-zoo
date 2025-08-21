import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { stripePromise } from '@/lib/stripe'

export function useStripe() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      setError('請先登入')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      })

      const { sessionId, error: responseError } = await response.json()

      if (responseError) {
        throw new Error(responseError)
      }

      // 重定向到Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        })

        if (stripeError) {
          throw new Error(stripeError.message)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '支付處理失敗')
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async (subscriptionId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      })

      const { error: responseError } = await response.json()

      if (responseError) {
        throw new Error(responseError)
      }

      // 重新載入頁面以更新狀態
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消訂閱失敗')
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckoutSession,
    cancelSubscription,
    loading,
    error,
  }
}
