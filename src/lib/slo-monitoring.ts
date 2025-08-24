/**
 * SLO (Service Level Objectives) 監控系統
 * 提供可用性、響應時間和錯誤率的監控和警報
 */

export interface SLOConfig {
  id: string
  name: string
  description: string
  
  // SLO 目標
  targets: {
    availability: number // 99.9 = 99.9%
    responseTime: number // 500 = 500ms
    errorRate: number // 1 = 1%
  }
  
  // 監控窗口
  window: {
    duration: number // 秒
    type: 'rolling' | 'fixed'
  }
  
  // 警報配置
  alerts: {
    enabled: boolean
    thresholds: {
      warning: number // 80% of target
      critical: number // 95% of target
    }
    notifications: {
      email?: string[]
      webhook?: string
      slack?: string
    }
  }
  
  created_at: string
  updated_at: string
}

export interface SLOMetric {
  id: string
  sloId: string
  timestamp: string
  
  // 實際指標
  availability: number
  responseTime: number
  errorRate: number
  
  // 合規性
  compliance: {
    availability: 'met' | 'missed'
    responseTime: 'met' | 'missed'
    errorRate: 'met' | 'missed'
  }
  
  // 計算數據
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalResponseTime: number
}

export interface SLOAlert {
  id: string
  sloId: string
  severity: 'warning' | 'critical'
  metric: 'availability' | 'responseTime' | 'errorRate'
  currentValue: number
  targetValue: number
  message: string
  timestamp: string
  resolved: boolean
  resolvedAt?: string
}

/**
 * SLO 監控服務
 */
export class SLOMonitoringService {
  private sloConfigs: SLOConfig[] = []
  private metrics: SLOMetric[] = []
  private alerts: SLOAlert[] = []
  
  constructor() {
    this.initializeDefaultSLOs()
  }

  /**
   * 初始化默認 SLO 配置
   */
  private initializeDefaultSLOs(): void {
    this.sloConfigs = [
      {
        id: 'default-availability',
        name: '服務可用性',
        description: '確保服務 99.9% 的時間可用',
        targets: {
          availability: 99.9,
          responseTime: 500,
          errorRate: 1
        },
        window: {
          duration: 3600, // 1小時
          type: 'rolling'
        },
        alerts: {
          enabled: true,
          thresholds: {
            warning: 80,
            critical: 95
          },
          notifications: {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'api-performance',
        name: 'API 性能',
        description: 'API 響應時間和錯誤率監控',
        targets: {
          availability: 99.5,
          responseTime: 1000,
          errorRate: 2
        },
        window: {
          duration: 1800, // 30分鐘
          type: 'rolling'
        },
        alerts: {
          enabled: true,
          thresholds: {
            warning: 80,
            critical: 95
          },
          notifications: {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  /**
   * 記錄請求指標
   */
  recordRequest(
    sloId: string,
    success: boolean,
    responseTime: number,
    timestamp: string = new Date().toISOString()
  ): void {
    const slo = this.sloConfigs.find(s => s.id === sloId)
    if (!slo) {
      console.warn(`SLO ${sloId} not found`)
      return
    }

    // 更新或創建指標記錄
    const windowStart = new Date(timestamp)
    windowStart.setSeconds(windowStart.getSeconds() - slo.window.duration)

    let metric = this.metrics.find(m => 
      m.sloId === sloId && 
      new Date(m.timestamp) >= windowStart
    )

    if (!metric) {
      metric = {
        id: `metric-${Date.now()}`,
        sloId,
        timestamp,
        availability: 0,
        responseTime: 0,
        errorRate: 0,
        compliance: {
          availability: 'met',
          responseTime: 'met',
          errorRate: 'met'
        },
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalResponseTime: 0
      }
      this.metrics.push(metric)
    }

    // 更新指標
    metric.totalRequests++
    metric.totalResponseTime += responseTime

    if (success) {
      metric.successfulRequests++
    } else {
      metric.failedRequests++
    }

    // 計算百分比
    metric.availability = (metric.successfulRequests / metric.totalRequests) * 100
    metric.errorRate = (metric.failedRequests / metric.totalRequests) * 100
    metric.responseTime = metric.totalResponseTime / metric.totalRequests

    // 檢查合規性
    metric.compliance.availability = metric.availability >= slo.targets.availability ? 'met' : 'missed'
    metric.compliance.responseTime = metric.responseTime <= slo.targets.responseTime ? 'met' : 'missed'
    metric.compliance.errorRate = metric.errorRate <= slo.targets.errorRate ? 'met' : 'missed'

    // 檢查警報
    this.checkAlerts(slo, metric)
  }

  /**
   * 檢查警報條件
   */
  private checkAlerts(slo: SLOConfig, metric: SLOMetric): void {
    if (!slo.alerts.enabled) return

    const checks = [
      {
        metric: 'availability' as const,
        current: metric.availability,
        target: slo.targets.availability,
        operator: 'gte' as const
      },
      {
        metric: 'responseTime' as const,
        current: metric.responseTime,
        target: slo.targets.responseTime,
        operator: 'lte' as const
      },
      {
        metric: 'errorRate' as const,
        current: metric.errorRate,
        target: slo.targets.errorRate,
        operator: 'lte' as const
      }
    ]

    for (const check of checks) {
      const compliance = metric.compliance[check.metric]
      const targetPercentage = slo.alerts.thresholds.critical
      const warningPercentage = slo.alerts.thresholds.warning

      let severity: 'warning' | 'critical' | null = null
      let message = ''

      if (compliance === 'missed') {
        const performance = this.calculatePerformance(check.current, check.target, check.operator)
        
        if (performance <= warningPercentage) {
          severity = 'warning'
          message = `${check.metric} 性能警告: ${check.current} (目標: ${check.target})`
        }
        
        if (performance <= targetPercentage) {
          severity = 'critical'
          message = `${check.metric} 嚴重警告: ${check.current} (目標: ${check.target})`
        }
      }

      if (severity) {
        const alert: SLOAlert = {
          id: `alert-${Date.now()}-${check.metric}`,
          sloId: slo.id,
          severity,
          metric: check.metric,
          currentValue: check.current,
          targetValue: check.target,
          message,
          timestamp: new Date().toISOString(),
          resolved: false
        }

        this.alerts.push(alert)
        this.sendNotification(alert, slo)
      }
    }
  }

  /**
   * 計算性能百分比
   */
  private calculatePerformance(current: number, target: number, operator: 'gte' | 'lte'): number {
    if (operator === 'gte') {
      return Math.min(100, (current / target) * 100)
    } else {
      return Math.min(100, (target / current) * 100)
    }
  }

  /**
   * 發送通知
   */
  private sendNotification(alert: SLOAlert, slo: SLOConfig): void {
    // 這裡可以實現實際的通知邏輯
    console.log(`SLO Alert: ${alert.severity.toUpperCase()} - ${alert.message}`)
    
    // 示例：發送到 webhook
    if (slo.alerts.notifications.webhook) {
      fetch(slo.alerts.notifications.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      }).catch(err => console.error('Webhook notification failed:', err))
    }
  }

  /**
   * 獲取 SLO 配置
   */
  getSLOConfigs(): SLOConfig[] {
    return this.sloConfigs
  }

  /**
   * 獲取 SLO 指標
   */
  getSLOMetrics(sloId?: string, timeRange: '1h' | '24h' | '7d' = '24h'): SLOMetric[] {
    let metrics = this.metrics

    if (sloId) {
      metrics = metrics.filter(m => m.sloId === sloId)
    }

    const now = new Date()
    const rangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeRange]

    return metrics.filter(m => 
      new Date(m.timestamp) >= new Date(now.getTime() - rangeMs)
    )
  }

  /**
   * 獲取活躍警報
   */
  getActiveAlerts(): SLOAlert[] {
    return this.alerts.filter(a => !a.resolved)
  }

  /**
   * 解決警報
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = new Date().toISOString()
    }
  }

  /**
   * 獲取 SLO 合規性報告
   */
  getSLOComplianceReport(timeRange: '1h' | '24h' | '7d' = '24h'): {
    sloId: string
    name: string
    availability: { target: number; actual: number; compliance: 'met' | 'missed' }
    responseTime: { target: number; actual: number; compliance: 'met' | 'missed' }
    errorRate: { target: number; actual: number; compliance: 'met' | 'missed' }
    overallCompliance: 'met' | 'missed'
  }[] {
    const metrics = this.getSLOMetrics(undefined, timeRange)
    
    return this.sloConfigs.map(slo => {
      const sloMetrics = metrics.filter(m => m.sloId === slo.id)
      
      if (sloMetrics.length === 0) {
        return {
          sloId: slo.id,
          name: slo.name,
          availability: { target: slo.targets.availability, actual: 0, compliance: 'missed' as const },
          responseTime: { target: slo.targets.responseTime, actual: 0, compliance: 'missed' as const },
          errorRate: { target: slo.targets.errorRate, actual: 0, compliance: 'missed' as const },
          overallCompliance: 'missed' as const
        }
      }

      // 計算平均值
      const avgAvailability = sloMetrics.reduce((sum, m) => sum + m.availability, 0) / sloMetrics.length
      const avgResponseTime = sloMetrics.reduce((sum, m) => sum + m.responseTime, 0) / sloMetrics.length
      const avgErrorRate = sloMetrics.reduce((sum, m) => sum + m.errorRate, 0) / sloMetrics.length

      const availabilityCompliance = avgAvailability >= slo.targets.availability ? 'met' : 'missed'
      const responseTimeCompliance = avgResponseTime <= slo.targets.responseTime ? 'met' : 'missed'
      const errorRateCompliance = avgErrorRate <= slo.targets.errorRate ? 'met' : 'missed'

      const overallCompliance = 
        availabilityCompliance === 'met' && 
        responseTimeCompliance === 'met' && 
        errorRateCompliance === 'met' ? 'met' : 'missed'

      return {
        sloId: slo.id,
        name: slo.name,
        availability: { target: slo.targets.availability, actual: avgAvailability, compliance: availabilityCompliance },
        responseTime: { target: slo.targets.responseTime, actual: avgResponseTime, compliance: responseTimeCompliance },
        errorRate: { target: slo.targets.errorRate, actual: avgErrorRate, compliance: errorRateCompliance },
        overallCompliance
      }
    })
  }
}

/**
 * 全局 SLO 監控服務實例
 */
export const sloMonitoringService = new SLOMonitoringService()

/**
 * SLO 監控 Hook
 */
export function useSLOMonitoring(refreshInterval: number = 30000) {
  const [configs, setConfigs] = useState<SLOConfig[]>([])
  const [metrics, setMetrics] = useState<SLOMetric[]>([])
  const [alerts, setAlerts] = useState<SLOAlert[]>([])
  const [compliance, setCompliance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const updateData = () => {
      setConfigs(sloMonitoringService.getSLOConfigs())
      setMetrics(sloMonitoringService.getSLOMetrics())
      setAlerts(sloMonitoringService.getActiveAlerts())
      setCompliance(sloMonitoringService.getSLOComplianceReport())
      setLoading(false)
    }

    updateData()
    intervalId = setInterval(updateData, refreshInterval)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [refreshInterval])

  return { configs, metrics, alerts, compliance, loading }
}

// 需要在文件頂部添加 React 導入
import { useState, useEffect } from 'react'

