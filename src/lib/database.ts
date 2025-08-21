import { supabase } from './supabase'
import { Database } from './types'

// 類型定義
export type User = Database['public']['Tables']['users']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Feature = Database['public']['Tables']['features']['Row']
export type UserFeature = Database['public']['Tables']['user_features']['Row']
export type PipelineMetric = Database['public']['Tables']['pipeline_metrics']['Row']
export type SalvageLog = Database['public']['Tables']['salvage_logs']['Row']

// 用戶相關操作
export const userService = {
  // 獲取當前用戶資料
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  },

  // 更新用戶資料
  async updateUser(updates: Partial<User>): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }

    return data
  }
}

// 訂閱相關操作
export const subscriptionService = {
  // 獲取用戶訂閱
  async getUserSubscription(): Promise<Subscription | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return null
    }

    return data
  },

  // 檢查用戶是否有功能訪問權限
  async hasFeatureAccess(featureName: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .rpc('has_feature_access', {
        user_uuid: user.id,
        feature_name: featureName
      })

    if (error) {
      console.error('Error checking feature access:', error)
      return false
    }

    return data
  }
}

// 功能相關操作
export const featureService = {
  // 獲取所有功能
  async getAllFeatures(): Promise<Feature[]> {
    const { data, error } = await supabase
      .from('features')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching features:', error)
      return []
    }

    return data || []
  },

  // 獲取用戶的功能訪問權限
  async getUserFeatures(): Promise<UserFeature[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('user_features')
      .select(`
        *,
        features (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user features:', error)
      return []
    }

    return data || []
  }
}

// Entitlements Sandbox 相關操作
export const entitlementsService = {
  // 獲取租戶列表 (模擬數據，實際應該從數據庫)
  async getTenants(): Promise<any[]> {
    // TODO: 實現真實的租戶數據庫操作
    return [
      {
        id: 'tenant1',
        name: '示例租戶',
        domain: 'example.com',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]
  },

  // 獲取權限列表 (模擬數據，實際應該從數據庫)
  async getEntitlements(): Promise<any[]> {
    // TODO: 實現真實的權限數據庫操作
    return [
      {
        id: '1',
        name: '讀取用戶資料',
        description: '允許讀取用戶基本資料',
        resource: 'users',
        action: 'read',
        tenant_id: 'tenant1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: '創建訂單',
        description: '允許創建新的訂單',
        resource: 'orders',
        action: 'create',
        tenant_id: 'tenant1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
}

// JSON-AI Salvage Kit 相關操作
export const salvageService = {
  // 保存修復日誌
  async saveSalvageLog(log: Omit<SalvageLog, 'id' | 'created_at'>): Promise<SalvageLog | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('salvage_logs')
      .insert({
        ...log,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving salvage log:', error)
      return null
    }

    return data
  },

  // 獲取用戶的修復歷史
  async getSalvageHistory(limit = 10): Promise<SalvageLog[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('salvage_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching salvage history:', error)
      return []
    }

    return data || []
  },

  // 獲取修復統計
  async getSalvageStats(): Promise<{
    total: number
    successful: number
    failed: number
    totalCost: number
  }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { total: 0, successful: 0, failed: 0, totalCost: 0 }

    const { data, error } = await supabase
      .from('salvage_logs')
      .select('success, cost_usd')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching salvage stats:', error)
      return { total: 0, successful: 0, failed: 0, totalCost: 0 }
    }

    const total = data.length
    const successful = data.filter(log => log.success).length
    const failed = total - successful
    const totalCost = data.reduce((sum, log) => sum + (log.cost_usd || 0), 0)

    return { total, successful, failed, totalCost }
  }
}

// Pipeline Dashboard 相關操作
export const pipelineService = {
  // 保存管道指標
  async saveMetric(metric: Omit<PipelineMetric, 'id' | 'timestamp'>): Promise<PipelineMetric | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('pipeline_metrics')
      .insert({
        ...metric,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving pipeline metric:', error)
      return null
    }

    return data
  },

  // 獲取管道指標
  async getPipelineMetrics(pipelineName?: string, limit = 50): Promise<PipelineMetric[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase
      .from('pipeline_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (pipelineName) {
      query = query.eq('pipeline_name', pipelineName)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching pipeline metrics:', error)
      return []
    }

    return data || []
  },

  // 獲取管道統計
  async getPipelineStats(): Promise<{
    totalPipelines: number
    totalMetrics: number
    averageLatency: number
    totalCost: number
  }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { totalPipelines: 0, totalMetrics: 0, averageLatency: 0, totalCost: 0 }

    const { data, error } = await supabase
      .from('pipeline_metrics')
      .select('pipeline_name, metric_value, metadata')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching pipeline stats:', error)
      return { totalPipelines: 0, totalMetrics: 0, averageLatency: 0, totalCost: 0 }
    }

    const uniquePipelines = new Set(data.map(m => m.pipeline_name)).size
    const totalMetrics = data.length
    const latencyMetrics = data.filter(m => m.metric_name === 'latency')
    const averageLatency = latencyMetrics.length > 0 
      ? latencyMetrics.reduce((sum, m) => sum + Number(m.metric_value), 0) / latencyMetrics.length
      : 0

    // 計算總成本 (假設成本存儲在 metadata 中)
    const totalCost = data.reduce((sum, m) => {
      const cost = m.metadata?.cost || 0
      return sum + Number(cost)
    }, 0)

    return { totalPipelines: uniquePipelines, totalMetrics, averageLatency, totalCost }
  }
}
