'use client'

import { useState, useEffect } from 'react'
import { HealthReport, HealthStatus, HealthCategory } from '@/lib/types'

interface HealthDashboardProps {
  projectId: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function HealthDashboard({ 
  projectId, 
  autoRefresh = false, 
  refreshInterval = 300000 // 5 minutes
}: HealthDashboardProps) {
  const [report, setReport] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchHealthReport = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/health-check?projectId=${projectId}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '健康檢查失敗')
      }

      setReport(data.data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthReport()

    if (autoRefresh) {
      const interval = setInterval(fetchHealthReport, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [projectId, autoRefresh, refreshInterval])

  const getStatusColor = (status: HealthStatus): string => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: HealthStatus): string => {
    switch (status) {
      case 'excellent': return '🟢'
      case 'good': return '🔵'
      case 'warning': return '🟡'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  const getCategoryDisplayName = (category: HealthCategory): string => {
    const names: Record<HealthCategory, string> = {
      performance: '性能',
      security: '安全性',
      reliability: '可靠性',
      maintainability: '可維護性',
      scalability: '可擴展性',
      testing: '測試',
      documentation: '文檔',
      dependencies: '依賴管理',
      infrastructure: '基礎設施',
      monitoring: '監控'
    }
    return names[category] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在分析項目健康狀況...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">健康檢查失敗</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHealthReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            重新檢查
          </button>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">沒有可用的健康報告</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 標題和控制 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">項目健康儀表板</h1>
            <p className="text-gray-600 mt-2">
              項目 ID: {report.projectId}
              {lastUpdated && (
                <span className="ml-4">
                  最後更新: {lastUpdated.toLocaleString('zh-TW')}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchHealthReport}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '檢查中...' : '重新檢查'}
          </button>
        </div>

        {/* 總體健康狀況 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">總體健康分數</h2>
                <div className="flex items-center mt-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {report.overallScore}
                  </span>
                  <span className="text-2xl text-gray-500 ml-2">/100</span>
                  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.overallStatus)}`}>
                    {getStatusIcon(report.overallStatus)} {report.overallStatus.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">項目摘要</div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm">
                    <span className="text-green-600">✓ {report.summary.passedMetrics}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-gray-600">{report.summary.totalMetrics} 指標</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-red-600">⚠ {report.summary.criticalIssues}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-gray-600">{report.summary.totalIssues} 問題</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 類別概覽 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">類別健康狀況</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(report.categories).map(([category, data]) => (
              <div key={category} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {getCategoryDisplayName(category as HealthCategory)}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(data.status)}`}>
                    {getStatusIcon(data.status)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{data.score}</div>
                <div className="text-xs text-gray-500">{data.metrics.length} 指標</div>
              </div>
            ))}
          </div>
        </div>

        {/* 關鍵問題 */}
        {report.issues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">需要關注的問題</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y divide-gray-200">
                {report.issues.slice(0, 10).map((issue, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
                            issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getCategoryDisplayName(issue.category)}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mt-1">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue.description}
                        </p>
                        {issue.recommendation && (
                          <p className="text-sm text-blue-600 mt-2">
                            💡 {issue.recommendation}
                          </p>
                        )}
                      </div>
                      {issue.autoFixable && (
                        <button className="ml-4 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          自動修復
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 建議 */}
        {report.recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">改進建議</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <ul className="space-y-2">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">💡</span>
                    <span className="text-blue-800">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 詳細指標 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">詳細指標</h2>
          <div className="space-y-6">
            {Object.entries(report.categories).map(([category, data]) => (
              <div key={category} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getCategoryDisplayName(category as HealthCategory)}
                    <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${getStatusColor(data.status)}`}>
                      {data.score}/100
                    </span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.metrics.map((metric, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {metric.name}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                            {metric.score}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {metric.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          值: {typeof metric.value === 'boolean' ? 
                            (metric.value ? '是' : '否') : 
                            metric.value}
                        </div>
                        {metric.recommendation && (
                          <p className="text-xs text-blue-600 mt-2">
                            💡 {metric.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

