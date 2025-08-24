/**
 * Pipeline Dashboard - 實時監控系統
 * 提供 AI Pipeline 全流程監控、成本分析和用戶體驗追蹤
 */

export interface PipelineMetric {
  id: string
  pipelineName: string
  status: 'running' | 'completed' | 'failed' | 'pending' | 'paused'
  startTime: string
  endTime?: string
  duration?: number
  progress: number
  
  // 性能指標
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  
  // 成本指標
  totalCost: number
  costPerRequest: number
  tokenUsage: number
  
  // 用戶體驗指標
  userSatisfactionScore?: number
  errorRate: number
  timeoutRate: number
  
  // 元數據
  model: string
  endpoint: string
  region: string
  metadata?: Record<string, any>
}

export interface PipelineConfig {
  id: string
  name: string
  description: string
  model: string
  endpoint: string
  
  // 配置參數
  maxTokens: number
  temperature: number
  rateLimit: number
  timeout: number
  retryCount: number
  
  // 監控配置
  alertThresholds: {
    errorRate: number
    responseTime: number
    cost: number
  }
  
  // SLO 配置
  slo: {
    availability: number // 99.9%
    responseTime: number // ms
    errorRate: number // %
  }
  
  created_at: string
  updated_at: string
}

export interface RealTimeMetrics {
  timestamp: string
  activeRequests: number
  requestsPerSecond: number
  avgResponseTime: number
  errorRate: number
  totalCost: number
  
  // 資源使用
  cpuUsage?: number
  memoryUsage?: number
  
  // 地理分佈
  requestsByRegion: Record<string, number>
  
  // 模型使用統計
  modelUsage: Record<string, {
    requests: number
    tokens: number
    cost: number
  }>
}

export interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  
  // 通知配置
  notifications: {
    email?: string[]
    webhook?: string
    slack?: string
  }
}

export interface PipelineAlert {
  id: string
  ruleId: string
  pipelineId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
  resolvedAt?: string
}

/**
 * 實時監控服務
 */
export class PipelineMonitoringService {
  private metricsBuffer: RealTimeMetrics[] = []
  private alertRules: AlertRule[] = []
  private activeAlerts: PipelineAlert[] = []
  
  constructor() {
    this.initializeDefaultAlertRules()
  }

  /**
   * 獲取實時指標
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    // 模擬實時數據 - 在實際應用中會從監控系統獲取
    const now = new Date().toISOString()
    
    return {
      timestamp: now,
      activeRequests: Math.floor(Math.random() * 50) + 10,
      requestsPerSecond: Math.floor(Math.random() * 100) + 20,
      avgResponseTime: Math.floor(Math.random() * 500) + 100,
      errorRate: Math.random() * 5, // 0-5%
      totalCost: Math.random() * 10 + 5,
      
      requestsByRegion: {
        'us-east-1': Math.floor(Math.random() * 100),
        'eu-west-1': Math.floor(Math.random() * 80),
        'ap-southeast-1': Math.floor(Math.random() * 60)
      },
      
      modelUsage: {
        'gpt-4': {
          requests: Math.floor(Math.random() * 200),
          tokens: Math.floor(Math.random() * 50000),
          cost: Math.random() * 5
        },
        'claude-3-sonnet': {
          requests: Math.floor(Math.random() * 150),
          tokens: Math.floor(Math.random() * 40000),
          cost: Math.random() * 4
        }
      }
    }
  }

  /**
   * 獲取管道歷史指標
   */
  async getPipelineMetrics(
    pipelineId?: string,
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<PipelineMetric[]> {
    // 模擬歷史數據
    const metrics: PipelineMetric[] = []
    const count = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 30
    
    for (let i = 0; i < count; i++) {
      const startTime = new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
      const duration = Math.floor(Math.random() * 5000) + 1000
      
      metrics.push({
        id: `metric-${i}`,
        pipelineName: pipelineId || `pipeline-${Math.floor(Math.random() * 3) + 1}`,
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        startTime,
        endTime: new Date(new Date(startTime).getTime() + duration).toISOString(),
        duration,
        progress: 100,
        
        totalRequests: Math.floor(Math.random() * 1000) + 100,
        successfulRequests: Math.floor(Math.random() * 950) + 50,
        failedRequests: Math.floor(Math.random() * 50),
        avgResponseTime: Math.floor(Math.random() * 500) + 100,
        p95ResponseTime: Math.floor(Math.random() * 1000) + 500,
        p99ResponseTime: Math.floor(Math.random() * 2000) + 1000,
        
        totalCost: Math.random() * 20 + 5,
        costPerRequest: Math.random() * 0.1 + 0.01,
        tokenUsage: Math.floor(Math.random() * 100000) + 10000,
        
        errorRate: Math.random() * 5,
        timeoutRate: Math.random() * 2,
        
        model: Math.random() > 0.5 ? 'gpt-4' : 'claude-3-sonnet',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        region: 'us-east-1'
      })
    }
    
    return metrics.reverse() // 最新的在前面
  }

  /**
   * 獲取成本分析
   */
  async getCostAnalysis(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalCost: number
    costByModel: Record<string, number>
    costByRegion: Record<string, number>
    costTrend: Array<{ timestamp: string; cost: number }>
    projectedMonthlyCost: number
    costOptimizationSuggestions: Array<{
      type: 'model' | 'region' | 'configuration'
      suggestion: string
      potentialSavings: number
    }>
  }> {
    const totalCost = Math.random() * 1000 + 500
    
    return {
      totalCost,
      costByModel: {
        'gpt-4': totalCost * 0.6,
        'claude-3-sonnet': totalCost * 0.3,
        'gpt-3.5-turbo': totalCost * 0.1
      },
      costByRegion: {
        'us-east-1': totalCost * 0.5,
        'eu-west-1': totalCost * 0.3,
        'ap-southeast-1': totalCost * 0.2
      },
      costTrend: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        cost: Math.random() * 50 + 10
      })).reverse(),
      projectedMonthlyCost: totalCost * 30,
      costOptimizationSuggestions: [
        {
          type: 'model',
          suggestion: '考慮在非關鍵任務中使用 GPT-3.5-turbo 替代 GPT-4',
          potentialSavings: totalCost * 0.3
        },
        {
          type: 'configuration',
          suggestion: '優化 max_tokens 設置以減少不必要的 token 使用',
          potentialSavings: totalCost * 0.15
        },
        {
          type: 'region',
          suggestion: '將部分流量遷移到成本更低的地區',
          potentialSavings: totalCost * 0.1
        }
      ]
    }
  }

  /**
   * 獲取用戶體驗指標
   */
  async getUserExperienceMetrics(): Promise<{
    overallSatisfaction: number
    responseTimeDistribution: Record<string, number>
    errorTypeDistribution: Record<string, number>
    userFeedback: Array<{
      timestamp: string
      rating: number
      comment?: string
      category: string
    }>
    sloCompliance: {
      availability: { target: number; actual: number; status: 'met' | 'missed' }
      responseTime: { target: number; actual: number; status: 'met' | 'missed' }
      errorRate: { target: number; actual: number; status: 'met' | 'missed' }
    }
  }> {
    return {
      overallSatisfaction: 4.2 + Math.random() * 0.6,
      responseTimeDistribution: {
        '< 100ms': 15,
        '100-500ms': 60,
        '500ms-1s': 20,
        '> 1s': 5
      },
      errorTypeDistribution: {
        'timeout': 40,
        'rate_limit': 30,
        'invalid_request': 20,
        'server_error': 10
      },
      userFeedback: [
        {
          timestamp: new Date().toISOString(),
          rating: 5,
          comment: '響應速度很快，結果質量很好',
          category: 'performance'
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          rating: 3,
          comment: '偶爾會超時',
          category: 'reliability'
        }
      ],
      sloCompliance: {
        availability: { target: 99.9, actual: 99.95, status: 'met' },
        responseTime: { target: 500, actual: 450, status: 'met' },
        errorRate: { target: 1, actual: 0.8, status: 'met' }
      }
    }
  }

  /**
   * 獲取活躍警報
   */
  async getActiveAlerts(): Promise<PipelineAlert[]> {
    return this.activeAlerts.filter(alert => !alert.resolved)
  }

  /**
   * 創建警報規則
   */
  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: `rule-${Date.now()}`
    }
    
    this.alertRules.push(newRule)
    return newRule
  }

  /**
   * 檢查警報條件
   */
  async checkAlerts(metrics: RealTimeMetrics): Promise<PipelineAlert[]> {
    const newAlerts: PipelineAlert[] = []
    
    for (const rule of this.alertRules.filter(r => r.enabled)) {
      let shouldAlert = false
      let message = ''
      
      switch (rule.condition) {
        case 'error_rate':
          if (metrics.errorRate > rule.threshold) {
            shouldAlert = true
            message = `錯誤率 ${metrics.errorRate.toFixed(2)}% 超過閾值 ${rule.threshold}%`
          }
          break
        case 'response_time':
          if (metrics.avgResponseTime > rule.threshold) {
            shouldAlert = true
            message = `平均響應時間 ${metrics.avgResponseTime}ms 超過閾值 ${rule.threshold}ms`
          }
          break
        case 'cost':
          if (metrics.totalCost > rule.threshold) {
            shouldAlert = true
            message = `總成本 $${metrics.totalCost.toFixed(2)} 超過閾值 $${rule.threshold}`
          }
          break
      }
      
      if (shouldAlert) {
        const alert: PipelineAlert = {
          id: `alert-${Date.now()}-${rule.id}`,
          ruleId: rule.id,
          pipelineId: 'all',
          severity: rule.severity,
          message,
          timestamp: new Date().toISOString(),
          resolved: false
        }
        
        newAlerts.push(alert)
        this.activeAlerts.push(alert)
      }
    }
    
    return newAlerts
  }

  /**
   * 初始化默認警報規則
   */
  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'default-error-rate',
        name: '高錯誤率警報',
        condition: 'error_rate',
        threshold: 5,
        severity: 'high',
        enabled: true,
        notifications: {}
      },
      {
        id: 'default-response-time',
        name: '響應時間過長警報',
        condition: 'response_time',
        threshold: 1000,
        severity: 'medium',
        enabled: true,
        notifications: {}
      },
      {
        id: 'default-cost',
        name: '成本過高警報',
        condition: 'cost',
        threshold: 100,
        severity: 'medium',
        enabled: true,
        notifications: {}
      }
    ]
  }
}

/**
 * 全局監控服務實例
 */
export const pipelineMonitoringService = new PipelineMonitoringService()

/**
 * 實時數據 Hook
 */
export function useRealTimeMetrics(refreshInterval: number = 5000) {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const fetchMetrics = async () => {
      try {
        const data = await pipelineMonitoringService.getRealTimeMetrics()
        setMetrics(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    intervalId = setInterval(fetchMetrics, refreshInterval)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [refreshInterval])

  return { metrics, loading, error }
}

// 需要在文件頂部添加 React 導入
import { useState, useEffect } from 'react'

