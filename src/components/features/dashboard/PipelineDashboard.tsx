'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { subscriptionService, pipelineService } from '@/lib/database'
import { 
  pipelineMonitoringService, 
  useRealTimeMetrics,
  PipelineMetric,
  PipelineConfig,
  PipelineAlert 
} from '@/lib/pipeline-monitoring'

// 接口定義已移至 pipeline-monitoring.ts

export function PipelineDashboard() {
  const { user, profile } = useAuth()
  const [pipelines, setPipelines] = useState<PipelineMetric[]>([])
  const [configs, setConfigs] = useState<PipelineConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasAccess, setHasAccess] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null)
  const [activeAlerts, setActiveAlerts] = useState<PipelineAlert[]>([])
  const [costAnalysis, setCostAnalysis] = useState<any>(null)
  const [userExperience, setUserExperience] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  
  // 使用實時監控 Hook
  const { metrics: realTimeMetrics, loading: metricsLoading, error: metricsError } = useRealTimeMetrics(5000)

  useEffect(() => {
    checkAccess()
  }, [user])

  useEffect(() => {
    if (hasAccess) {
      loadData()
    }
  }, [hasAccess, timeRange, selectedPipeline])

  const checkAccess = async () => {
    if (!user) return
    
    try {
      const access = await subscriptionService.hasFeatureAccess('pipeline_dashboard')
      setHasAccess(access)
      
      if (access) {
        loadData()
      }
    } catch (err) {
      setError('權限檢查失敗')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // 使用新的監控服務加載數據
      const [pipelineMetrics, costData, uxData, alerts] = await Promise.all([
        pipelineMonitoringService.getPipelineMetrics(selectedPipeline || undefined, timeRange),
        pipelineMonitoringService.getCostAnalysis(timeRange === '1h' ? '24h' : timeRange),
        pipelineMonitoringService.getUserExperienceMetrics(),
        pipelineMonitoringService.getActiveAlerts()
      ])

      setPipelines(pipelineMetrics)
      setCostAnalysis(costData)
      setUserExperience(uxData)
      setActiveAlerts(alerts)

      // 模擬配置數據 (可以後續從數據庫加載)
      const mockConfigs: PipelineConfig[] = [
        {
          id: '1',
          name: 'GPT-4 生產配置',
          description: '用於生產環境的 GPT-4 管道配置',
          model: 'gpt-4',
          endpoint: 'https://api.openai.com/v1/chat/completions',
          maxTokens: 4096,
          temperature: 0.7,
          rateLimit: 100,
          timeout: 30000,
          retryCount: 3,
          alertThresholds: {
            errorRate: 5,
            responseTime: 1000,
            cost: 100
          },
          slo: {
            availability: 99.9,
            responseTime: 500,
            errorRate: 1
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Claude 對話配置',
          description: '用於對話處理的 Claude 管道配置',
          model: 'claude-3-sonnet',
          endpoint: 'https://api.anthropic.com/v1/messages',
          maxTokens: 8192,
          temperature: 0.5,
          rateLimit: 50,
          timeout: 60000,
          retryCount: 2,
          alertThresholds: {
            errorRate: 3,
            responseTime: 2000,
            cost: 50
          },
          slo: {
            availability: 99.5,
            responseTime: 1000,
            errorRate: 2
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setConfigs(mockConfigs)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('數據加載失敗')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '運行中'
      case 'completed':
        return '已完成'
      case 'failed':
        return '失敗'
      case 'pending':
        return '等待中'
      default:
        return '未知'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h2>
          <p className="text-gray-600">您需要登入才能訪問 Pipeline Dashboard</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">權限不足</h2>
          <p className="text-gray-600">您沒有訪問 Pipeline Dashboard 的權限</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Dashboard</h1>
          <p className="mt-2 text-gray-600">AI 管道監控和管理</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">總管道數</h3>
            <p className="text-2xl font-bold text-gray-900">{pipelines.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">運行中</h3>
            <p className="text-2xl font-bold text-blue-600">
              {pipelines.filter(p => p.status === 'running').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">成功率</h3>
            <p className="text-2xl font-bold text-green-600">
              {(pipelines.reduce((acc, p) => acc + p.success_rate, 0) / pipelines.length * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">平均響應時間</h3>
            <p className="text-2xl font-bold text-gray-900">
              {(pipelines.reduce((acc, p) => acc + p.avg_response_time, 0) / pipelines.length).toFixed(1)}s
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 管道監控 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">管道監控</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pipelines.map(pipeline => (
                  <div key={pipeline.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{pipeline.name}</h3>
                        <p className="text-sm text-gray-500">
                          開始時間: {new Date(pipeline.start_time).toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pipeline.status)}`}>
                        {getStatusText(pipeline.status)}
                      </span>
                    </div>
                    
                    {/* 進度條 */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>進度</span>
                        <span>{pipeline.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pipeline.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 統計信息 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">成功率:</span>
                        <span className="ml-1 font-medium">{(pipeline.success_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">總請求:</span>
                        <span className="ml-1 font-medium">{pipeline.total_requests}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">成功:</span>
                        <span className="ml-1 font-medium text-green-600">{pipeline.successful_requests}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">失敗:</span>
                        <span className="ml-1 font-medium text-red-600">{pipeline.failed_requests}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 管道配置 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">管道配置</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {configs.map(config => (
                  <div key={config.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{config.name}</h3>
                        <p className="text-sm text-gray-500">{config.description}</p>
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-gray-500">
                            模型: <span className="font-medium">{config.model}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            速率限制: <span className="font-medium">{config.rate_limit}/min</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            超時: <span className="font-medium">{config.timeout}s</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        編輯
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                啟動新管道
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                創建配置
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                查看日誌
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                停止所有
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

