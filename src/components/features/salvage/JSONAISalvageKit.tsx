'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { subscriptionService, salvageService } from '@/lib/database'
import { 
  smartSalvageJSON, 
  getAvailableStrategies, 
  analyzeErrorHotspots,
  SalvageStrategy,
  SalvageResult as SmartSalvageResult
} from '@/lib/json-salvage-strategies'

interface SalvageResult {
  original: string
  repaired: string
  strategy: string
  confidence: number
  timestamp: string
  cost?: number
  processingTime?: number
  appliedStrategies?: string[]
  errorHotspots?: Array<{
    line: number
    column: number
    error: string
    suggestion: string
  }>
}

export function JSONAISalvageKit() {
  const { user, profile } = useAuth()
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasAccess, setHasAccess] = useState(false)
  const [salvageHistory, setSalvageHistory] = useState<SalvageResult[]>([])
  const [strategies, setStrategies] = useState<SalvageStrategy[]>([])
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'enterprise'>('free')
  const [errorHotspots, setErrorHotspots] = useState<Array<{
    line: number
    column: number
    error: string
    suggestion: string
  }>>([])
  const [costEstimate, setCostEstimate] = useState(0)

  useEffect(() => {
    checkAccess()
    loadSalvageHistory()
    loadUserTier()
  }, [user])

  const loadUserTier = async () => {
    if (!user) return
    
    try {
      const subscription = await subscriptionService.getUserSubscription()
      if (subscription?.status === 'active') {
        // 根據訂閱類型確定等級 - 這裡簡化為 pro
        setUserTier('pro')
      } else {
        setUserTier('free')
      }
      
      // 載入可用策略
      const availableStrategies = getAvailableStrategies(userTier)
      setStrategies(availableStrategies)
    } catch (err) {
      console.error('Error loading user tier:', err)
      setUserTier('free')
      setStrategies(getAvailableStrategies('free'))
    }
  }

  const checkAccess = async () => {
    if (!user) return
    
    try {
      const access = await subscriptionService.hasFeatureAccess('json_salvage_kit')
      setHasAccess(access)
    } catch (err) {
      setError('權限檢查失敗')
    }
  }

  const loadSalvageHistory = async () => {
    if (!user) return
    
    try {
      const history = await salvageService.getSalvageHistory(5)
      setSalvageHistory(history.map(log => ({
        original: log.original_json,
        repaired: log.repaired_json || '',
        strategy: log.repair_strategy || '',
        confidence: 0.8,
        timestamp: log.created_at
      })))
    } catch (err) {
      console.error('Error loading salvage history:', err)
    }
  }

  const salvageJSON = async () => {
    if (!inputText.trim()) {
      setError('請輸入需要修復的 JSON 文本')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 分析錯誤熱點
      const hotspots = analyzeErrorHotspots(inputText)
      setErrorHotspots(hotspots)

      // 使用智能修復系統
      const maxCost = userTier === 'free' ? 0 : userTier === 'pro' ? 0.05 : 0.20
      const salvageResult = await smartSalvageJSON(inputText, userTier, maxCost)
      
      setOutputText(salvageResult.repaired)
      setCostEstimate(salvageResult.cost)
      
      // 保存到數據庫
      const log = await salvageService.saveSalvageLog({
        original_json: inputText,
        repaired_json: salvageResult.success ? salvageResult.repaired : null,
        schema_definition: '',
        repair_strategy: salvageResult.appliedStrategies.join(', '),
        success: salvageResult.success,
        error_message: salvageResult.errorMessage || null,
        processing_time_ms: salvageResult.processingTime,
        cost_usd: salvageResult.cost
      })
      
      if (log) {
        // 更新本地歷史記錄
        const result: SalvageResult = {
          original: inputText,
          repaired: salvageResult.repaired,
          strategy: salvageResult.appliedStrategies.join(', '),
          confidence: salvageResult.confidence,
          timestamp: new Date().toISOString(),
          cost: salvageResult.cost,
          processingTime: salvageResult.processingTime,
          appliedStrategies: salvageResult.appliedStrategies,
          errorHotspots: hotspots
        }
        
        setSalvageHistory(prev => [result, ...prev.slice(0, 9)]) // 保留最近10條記錄
      }

      if (!salvageResult.success) {
        setError(salvageResult.errorMessage || '修復失敗，請檢查輸入')
      }
    } catch (err) {
      console.error('Salvage error:', err)
      setError('修復過程失敗')
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setError('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h2>
          <p className="text-gray-600">您需要登入才能訪問 JSON-AI Salvage Kit</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">權限不足</h2>
          <p className="text-gray-600">您沒有訪問 JSON-AI Salvage Kit 的權限</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">JSON-AI Salvage Kit</h1>
          <p className="mt-2 text-gray-600">AI 輸出格式修復工具</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 用戶等級和成本信息 */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-blue-900">當前等級: {userTier.toUpperCase()}</h3>
              <p className="text-sm text-blue-700">
                可用策略: {strategies.length} 個 | 
                最大成本: ${userTier === 'free' ? '0.00' : userTier === 'pro' ? '0.05' : '0.20'}
              </p>
            </div>
            {costEstimate > 0 && (
              <div className="text-right">
                <p className="text-sm text-blue-900">預估成本</p>
                <p className="text-lg font-bold text-blue-700">${costEstimate.toFixed(4)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 輸入區域 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">輸入 JSON</h2>
            </div>
            <div className="p-6">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  // 實時分析錯誤熱點
                  if (e.target.value.trim()) {
                    const hotspots = analyzeErrorHotspots(e.target.value)
                    setErrorHotspots(hotspots)
                  } else {
                    setErrorHotspots([])
                  }
                }}
                placeholder="請輸入需要修復的 JSON 文本..."
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
              
              {/* 錯誤熱點顯示 */}
              {errorHotspots.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">檢測到的問題:</h4>
                  <div className="space-y-1">
                    {errorHotspots.slice(0, 3).map((hotspot, index) => (
                      <div key={index} className="text-sm text-yellow-700">
                        <span className="font-medium">第 {hotspot.line} 行:</span> {hotspot.error}
                        <span className="text-yellow-600 ml-2">→ {hotspot.suggestion}</span>
                      </div>
                    ))}
                    {errorHotspots.length > 3 && (
                      <p className="text-sm text-yellow-600">還有 {errorHotspots.length - 3} 個問題...</p>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={salvageJSON}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '修復中...' : '開始修復'}
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  清除
                </button>
              </div>
            </div>
          </div>

          {/* 輸出區域 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">修復結果</h2>
              {outputText && (
                <button
                  onClick={() => copyToClipboard(outputText)}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  複製
                </button>
              )}
            </div>
            <div className="p-6">
              <textarea
                value={outputText}
                readOnly
                placeholder="修復後的 JSON 將顯示在這裡..."
                className="w-full h-64 p-4 border border-gray-300 rounded-md bg-gray-50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 修復策略 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">可用修復策略</h2>
            <p className="text-sm text-gray-500 mt-1">根據您的訂閱等級顯示可用策略</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategies.map(strategy => {
                const getCategoryColor = (category: string) => {
                  switch (category) {
                    case 'basic': return 'bg-green-100 text-green-800'
                    case 'intermediate': return 'bg-blue-100 text-blue-800'
                    case 'advanced': return 'bg-purple-100 text-purple-800'
                    case 'ai_powered': return 'bg-red-100 text-red-800'
                    default: return 'bg-gray-100 text-gray-800'
                  }
                }
                
                const getCostColor = (costLevel: string) => {
                  switch (costLevel) {
                    case 'free': return 'bg-green-50 text-green-700 border-green-200'
                    case 'low': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200'
                    case 'high': return 'bg-red-50 text-red-700 border-red-200'
                    default: return 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                }

                return (
                  <div key={strategy.id} className={`border rounded-md p-4 ${getCostColor(strategy.costLevel)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{strategy.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(strategy.category)}`}>
                        {strategy.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          優先級: {strategy.priority}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          信心度: {Math.round(strategy.confidence * 100)}%
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {strategy.costLevel === 'free' ? '免費' : strategy.costLevel}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* 策略統計 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {strategies.filter(s => s.category === 'basic').length}
                  </p>
                  <p className="text-sm text-gray-500">基礎策略</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {strategies.filter(s => s.category === 'intermediate').length}
                  </p>
                  <p className="text-sm text-gray-500">中級策略</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {strategies.filter(s => s.category === 'advanced').length}
                  </p>
                  <p className="text-sm text-gray-500">高級策略</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {strategies.filter(s => s.category === 'ai_powered').length}
                  </p>
                  <p className="text-sm text-gray-500">AI 策略</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 修復歷史 */}
        {salvageHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">修復歷史</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {salvageHistory.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          使用策略: {result.strategy}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          信心度: {(result.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.repaired)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        複製結果
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
