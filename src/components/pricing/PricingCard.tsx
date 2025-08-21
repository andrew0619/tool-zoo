'use client'

import { useStripe } from '@/hooks/useStripe'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: 'primary' | 'outline'
  priceId: string | null
  popular?: boolean
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  priceId,
  popular = false
}: PricingCardProps) {
  const { createCheckoutSession, loading, error } = useStripe()
  const { user } = useAuth()
  const router = useRouter()

  const handleButtonClick = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (priceId) {
      await createCheckoutSession(priceId)
    } else {
      // Free tier - 直接導向到功能頁面
      router.push('/dashboard')
    }
  }

  const buttonClasses = buttonVariant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'

  return (
    <div className={`relative bg-white rounded-lg shadow-lg p-8 ${popular ? 'ring-2 ring-blue-500' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            最受歡迎
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-600">/{period}</span>
        </div>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>

      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <button
          onClick={handleButtonClick}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
        >
          {loading ? '處理中...' : buttonText}
        </button>

        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
