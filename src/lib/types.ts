import { z } from 'zod'

// 用戶相關類型
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  stripe_customer_id: z.string().nullable(),
  created_at: z.string()
})

export type User = z.infer<typeof UserSchema>

// 訂閱相關類型
export const SubscriptionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  stripe_subscription_id: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid']),
  created_at: z.string()
})

export type Subscription = z.infer<typeof SubscriptionSchema>

// 權限相關類型
export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  required_subscription: z.enum(['free', 'pro', 'enterprise'])
})

export type Feature = z.infer<typeof FeatureSchema>

// JSON修復相關類型
export const SalvageStrategySchema = z.object({
  level: z.enum(['basic', 'advanced', 'expert']),
  maxRetries: z.number().min(1).max(10),
  costLimit: z.number().min(0)
})

export type SalvageStrategy = z.infer<typeof SalvageStrategySchema>

// 監控相關類型
export const MetricsSchema = z.object({
  timestamp: z.string(),
  value: z.number(),
  unit: z.string(),
  category: z.enum(['performance', 'cost', 'error', 'user'])
})

export type Metrics = z.infer<typeof MetricsSchema>

// API響應類型
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional()
})

export type ApiResponse = z.infer<typeof ApiResponseSchema>
