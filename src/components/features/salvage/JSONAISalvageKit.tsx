'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { checkFeatureAccess } from '@/lib/supabase-auth'

interface SalvageStrategy {
  id: string
  name: string
  description: string
  pattern: string
  replacement: string
  priority: number
  created_at: string
}

interface SalvageResult {
  original: string
  repaired: string
  strategy: string
  confidence: number
  timestamp: string
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

  // 模擬的修復策略
  const mockStrategies: SalvageStrategy[] = [
    {
      id: '1',
      name: '修復缺少引號的鍵',
      description: '修復 JSON 中缺少引號的鍵名',
      pattern: '([{,]\\s*)([a-zA-Z_][a-zA-Z0-9_]*)\\s*:',
      replacement: '$1"$2":',
      priority: 1,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: '修復尾隨逗號',
      description: '移除 JSON 對象和數組中的尾隨逗號',
      pattern: ',\\s*([}\]])',
      replacement: '$1',
      priority: 2,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: '修復單引號',
      description: '將單引號替換為雙引號',
      pattern: "'([^']*)'",
      replacement: '"$1"',
      priority: 3,
      created_at: new Date().toISOString()
    }
  ]

  useState(() => {
    setStrategies(mockStrategies)
    checkAccess()
  }, [])

  const checkAccess = async () => {
    if (!user) return
    
    try {
      const access = await checkFeatureAccess('json_ai_salvage_kit')
      setHasAccess(access)
    } catch (err) {
      setError('權限檢查失敗')
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
      // 模擬修復過程
      let repaired = inputText

      // 應用修復策略
      for (const strategy of strategies.sort((a, b) => a.priority - b.priority)) {
        const regex = new RegExp(strategy.pattern, 'g')
        repaired = repaired.replace(regex, strategy.replacement)
      }

      // 嘗試解析 JSON 以驗證修復結果
      try {
        JSON.parse(repaired)
        setOutputText(repaired)
        
        // 記錄修復歷史
        const result: SalvageResult = {
          original: inputText,
          repaired: repaired,
          strategy: strategies.map(s => s.name).join(', '),
          confidence: 0.95,
          timestamp: new Date().toISOString()
        }
        
        setSalvageHistory(prev => [result, ...prev.slice(0, 9)]) // 保留最近10條記錄
      } catch (parseError) {
        setError('修復後的 JSON 仍然無效，請檢查輸入')
      }
    } catch (err) {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 輸入區域 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">輸入 JSON</h2>
            </div>
            <div className="p-6">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="請輸入需要修復的 JSON 文本..."
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
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
            <h2 className="text-lg font-medium text-gray-900">修復策略</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategies.map(strategy => (
                <div key={strategy.id} className="border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-900">{strategy.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{strategy.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      優先級: {strategy.priority}
                    </span>
                  </div>
                </div>
              ))}
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
