import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

export const stripePromise = loadStripe(stripePublishableKey)

// Stripe產品配置
export const STRIPE_PRODUCTS = {
  PRO: {
    name: 'Tool Zoo Pro',
    priceId: 'price_pro_monthly', // 需要替換為實際的Stripe Price ID
    features: [
      'Entitlements Sandbox',
      'JSON-AI Salvage Kit',
      'Pipeline Dashboard',
      '優先支援'
    ]
  },
  ENTERPRISE: {
    name: 'Tool Zoo Enterprise',
    priceId: 'price_enterprise_monthly', // 需要替換為實際的Stripe Price ID
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
