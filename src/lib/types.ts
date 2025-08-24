import { z } from 'zod'

// 用戶相關類型
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('請輸入有效的電子郵件地址'),
  stripe_customer_id: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional()
})

export type User = z.infer<typeof UserSchema>

// 用戶註冊/登錄表單驗證
export const SignUpSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string()
    .min(8, '密碼至少需要8個字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密碼必須包含大小寫字母和數字'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "密碼不匹配",
  path: ["confirmPassword"]
})

export const SignInSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(1, '密碼不能為空')
})

// 訂閱相關類型
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  stripe_subscription_id: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid']),
  current_period_start: z.string().datetime().optional(),
  current_period_end: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional()
})

export type Subscription = z.infer<typeof SubscriptionSchema>

// 權限相關類型
export const FeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '功能名稱不能為空'),
  description: z.string().optional(),
  required_tier: z.enum(['free', 'pro', 'enterprise']),
  created_at: z.string().datetime()
})

export type Feature = z.infer<typeof FeatureSchema>

// 用戶功能訪問類型
export const UserFeatureSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  feature_id: z.string().uuid(),
  is_active: z.boolean(),
  created_at: z.string().datetime()
})

export type UserFeature = z.infer<typeof UserFeatureSchema>

// 管道指標類型
export const PipelineMetricSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  pipeline_name: z.string().min(1, '管道名稱不能為空'),
  metric_name: z.string().min(1, '指標名稱不能為空'),
  metric_value: z.number().min(0, '指標值不能為負數'),
  metric_unit: z.string().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional()
})

export type PipelineMetric = z.infer<typeof PipelineMetricSchema>

// 修復日誌類型
export const SalvageLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  original_json: z.string().min(1, '原始JSON不能為空'),
  repaired_json: z.string().nullable(),
  schema_definition: z.string().optional(),
  repair_strategy: z.string().min(1, '修復策略不能為空'),
  success: z.boolean(),
  error_message: z.string().nullable(),
  processing_time_ms: z.number().min(0, '處理時間不能為負數'),
  cost_usd: z.number().min(0, '成本不能為負數'),
  created_at: z.string().datetime()
})

export type SalvageLog = z.infer<typeof SalvageLogSchema>

// JSON 修復相關類型
export const SalvageStrategySchema = z.object({
  level: z.enum(['basic', 'advanced', 'expert']),
  maxRetries: z.number().min(1).max(10),
  costLimit: z.number().min(0)
})

export type SalvageStrategy = z.infer<typeof SalvageStrategySchema>

// JSON 修復請求驗證
export const JSONRepairSchema = z.object({
  originalJson: z.string().min(1, 'JSON 內容不能為空'),
  schemaDefinition: z.string().optional(),
  repairStrategy: z.enum(['basic', 'advanced', 'expert']).default('basic'),
  maxRetries: z.number().min(1).max(10).default(3),
  costLimit: z.number().min(0).default(0.01)
})

// 管道配置驗證
export const PipelineConfigSchema = z.object({
  name: z.string().min(1, '管道名稱不能為空'),
  description: z.string().optional(),
  model: z.string().min(1, '模型名稱不能為空'),
  endpoint: z.string().url('請輸入有效的URL'),
  rateLimit: z.number().min(1, '速率限制必須大於0'),
  timeout: z.number().min(1, '超時時間必須大於0'),
  retryCount: z.number().min(0).max(10, '重試次數不能超過10次')
})



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

// 技術健康檢查相關類型
export const HealthStatusSchema = z.enum([
  'excellent',
  'good', 
  'warning',
  'critical',
  'unknown'
])

export const HealthCategorySchema = z.enum([
  'performance',
  'security',
  'reliability',
  'maintainability',
  'scalability',
  'testing',
  'documentation',
  'dependencies',
  'infrastructure',
  'monitoring'
])

export const HealthMetricSchema = z.object({
  name: z.string(),
  category: HealthCategorySchema,
  status: HealthStatusSchema,
  score: z.number().min(0).max(100),
  value: z.union([z.string(), z.number(), z.boolean()]),
  threshold: z.object({
    excellent: z.number().optional(),
    good: z.number().optional(),
    warning: z.number().optional(),
    critical: z.number().optional()
  }).optional(),
  description: z.string(),
  recommendation: z.string().optional(),
  lastChecked: z.string(),
  trend: z.enum(['improving', 'stable', 'degrading', 'unknown']).optional()
})

export const HealthIssueSchema = z.object({
  id: z.string(),
  category: HealthCategorySchema,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  description: z.string(),
  recommendation: z.string(),
  file: z.string().optional(),
  line: z.number().optional(),
  autoFixable: z.boolean().default(false),
  estimatedEffort: z.enum(['low', 'medium', 'high']).optional()
})

export const HealthReportSchema = z.object({
  projectId: z.string(),
  timestamp: z.string(),
  overallScore: z.number().min(0).max(100),
  overallStatus: HealthStatusSchema,
  categories: z.record(HealthCategorySchema, z.object({
    score: z.number().min(0).max(100),
    status: HealthStatusSchema,
    metrics: z.array(HealthMetricSchema)
  })),
  issues: z.array(HealthIssueSchema),
  recommendations: z.array(z.string()),
  summary: z.object({
    totalMetrics: z.number(),
    passedMetrics: z.number(),
    warningMetrics: z.number(),
    criticalMetrics: z.number(),
    totalIssues: z.number(),
    criticalIssues: z.number(),
    autoFixableIssues: z.number()
  }),
  trends: z.object({
    scoreChange: z.number().optional(),
    previousScore: z.number().optional(),
    improvingMetrics: z.number().default(0),
    degradingMetrics: z.number().default(0)
  }).optional()
})

export type HealthStatus = z.infer<typeof HealthStatusSchema>
export type HealthCategory = z.infer<typeof HealthCategorySchema>
export type HealthMetric = z.infer<typeof HealthMetricSchema>
export type HealthIssue = z.infer<typeof HealthIssueSchema>
export type HealthReport = z.infer<typeof HealthReportSchema>
