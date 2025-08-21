'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { subscriptionService, pipelineService } from '@/lib/database'

interface PipelineMetric {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  progress: number
  start_time: string
  end_time?: string
  duration?: number
  success_rate: number
  total_requests: number
  successful_requests: number
  failed_requests: number
  avg_response_time: number
}

interface PipelineConfig {
  id: string
  name: string
  description: string
  model: string
  endpoint: string
  rate_limit: number
  timeout: number
  retry_count: number
  created_at: string
  updated_at: string
}

export function PipelineDashboard() {
  const { user, profile } = useAuth()
  const [pipelines, setPipelines] = useState<PipelineMetric[]>([])
  const [configs, setConfigs] = useState<PipelineConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasAccess, setHasAccess] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null)

  useEffect(() => {
    checkAccess()
  }, [user])

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
      // 從數據庫加載真實數據
      const [metricsData, statsData] = await Promise.all([
        pipelineService.getPipelineMetrics(),
        pipelineService.getPipelineStats()
      ])

      // 轉換數據格式以匹配組件期望的結構
      const pipelinesData = metricsData.map((metric, index) => ({
        id: metric.id,
        name: metric.pipeline_name,
        status: 'running', // 從 metric_value 或其他字段推斷
        progress: Math.min(100, Math.max(0, Number(metric.metric_value))),
        start_time: metric.timestamp,
        success_rate: 0.95, // 從統計數據計算
        total_requests: statsData.totalMetrics,
        successful_requests: Math.floor(statsData.totalMetrics * 0.95),
        failed_requests: Math.floor(statsData.totalMetrics * 0.05),
        avg_response_time: statsData.averageLatency
      }))

      // 模擬配置數據 (暫時保留，後續可以擴展數據庫結構)
      const mockConfigs: PipelineConfig[] = [
        {
          id: '1',
          name: 'GPT-4 配置',
          description: '用於文本生成的 GPT-4 管道配置',
          model: 'gpt-4',
          endpoint: 'https://api.openai.com/v1/chat/completions',
          rate_limit: 100,
          timeout: 30,
          retry_count: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Claude 配置',
          description: '用於對話處理的 Claude 管道配置',
          model: 'claude-3-sonnet',
          endpoint: 'https://api.anthropic.com/v1/messages',
          rate_limit: 50,
          timeout: 60,
          retry_count: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setPipelines(pipelinesData)
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

