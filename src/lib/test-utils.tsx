import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/components/auth/AuthProvider'

// Mock Supabase client for tests
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(() => ({
      data: null,
      error: null,
    })),
  },
}))

// Mock Stripe for tests
jest.mock('@/lib/stripe', () => ({
  stripePromise: Promise.resolve({
    redirectToCheckout: jest.fn(),
  }),
}))

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: any
}

const AllTheProviders = ({ children, user }: { children: React.ReactNode; user?: any }) => {
  return (
    <AuthProvider initialUser={user}>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders user={user}>{children}</AllTheProviders>,
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

export const createMockSubscription = (overrides = {}) => ({
  id: 'test-subscription-id',
  user_id: 'test-user-id',
  stripe_subscription_id: 'sub_test123',
  status: 'active' as const,
  current_period_start: '2025-01-01T00:00:00Z',
  current_period_end: '2025-02-01T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

export const createMockFeature = (overrides = {}) => ({
  id: 'test-feature-id',
  name: 'test_feature',
  description: 'Test feature description',
  required_tier: 'pro' as const,
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

export const createMockSalvageLog = (overrides = {}) => ({
  id: 'test-salvage-id',
  user_id: 'test-user-id',
  original_json: '{"test": "data"}',
  repaired_json: '{"test": "data"}',
  schema_definition: '',
  repair_strategy: 'basic',
  success: true,
  error_message: null,
  processing_time_ms: 100,
  cost_usd: 0.001,
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

export const createMockPipelineMetric = (overrides = {}) => ({
  id: 'test-metric-id',
  user_id: 'test-user-id',
  pipeline_name: 'test_pipeline',
  metric_name: 'latency',
  metric_value: 100,
  metric_unit: 'ms',
  timestamp: '2025-01-01T00:00:00Z',
  metadata: {},
  ...overrides,
})

// Mock data for tests
export const mockFeatures = [
  createMockFeature({ name: 'entitlements_sandbox', required_tier: 'pro' }),
  createMockFeature({ name: 'json_salvage_kit', required_tier: 'pro' }),
  createMockFeature({ name: 'pipeline_dashboard', required_tier: 'pro' }),
]

export const mockSalvageLogs = [
  createMockSalvageLog({ success: true }),
  createMockSalvageLog({ success: false, error_message: 'Test error' }),
]

export const mockPipelineMetrics = [
  createMockPipelineMetric({ metric_name: 'latency', metric_value: 100 }),
  createMockPipelineMetric({ metric_name: 'throughput', metric_value: 50 }),
]

// Test utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const mockSupabaseResponse = (data: any, error: any = null) => {
  return { data, error }
}

export const mockSupabaseError = (message: string, code?: string) => {
  return {
    data: null,
    error: {
      message,
      code,
      details: '',
      hint: '',
    },
  }
}

