import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

export const stripePromise = loadStripe(stripePublishableKey)

// Stripe產品配置
export const STRIPE_PRODUCTS = {
  PRO: {
    name: 'Tool Zoo Pro',
    priceId: 'price_1RyPXxE5JO4XTFelzMjNHwbj1o1j9Dc66Lwlb4UnCCry3Yw8gh0F3hrYvTHNSJvguNUOSiD94J49RKg96nF46Zq700CVJklwxO', // 實際的 Stripe Price ID
    features: [
      'Entitlements Sandbox',
      'JSON-AI Salvage Kit',
      'Pipeline Dashboard',
      '優先支援'
    ]
  },
  ENTERPRISE: {
    name: 'Tool Zoo Enterprise',
    priceId: 'price_1RyPXxE5JO4XTFelWM1SWoUVWaVm7GYGCGaz4iL79l56JByp4RaCRxNl81no8B5B5scP6zLMKZEuamrwi43TX6JO00e0LQpvPk', // 實際的 Stripe Price ID
    features: [
      '所有Pro功能',
      '客製化開發',
      '專屬支援',
      'SLA保證'
    ]
  }
} as const

// 訂閱狀態
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid'
} as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]
