'use client'

import { useState } from 'react'
import { useUserFeedback, UserFeedback } from '@/lib/user-feedback'

interface FeedbackFormProps {
  userId: string
  userType: 'free' | 'pro' | 'enterprise'
  onSuccess?: () => void
  onCancel?: () => void
}

export function FeedbackForm({ userId, userType, onSuccess, onCancel }: FeedbackFormProps) {
  const { submitFeedback, loading } = useUserFeedback()
  
  const [formData, setFormData] = useState({
    type: 'general_feedback' as UserFeedback['type'],
    category: '',
    title: '',
    description: '',
    severity: 'medium' as UserFeedback['severity'],
    rating: 5,
    satisfaction: 8
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const feedbackTypes = [
    { value: 'bug_report', label: '錯誤報告', icon: '🐛' },
    { value: 'feature_request', label: '功能請求', icon: '💡' },
    { value: 'general_feedback', label: '一般反饋', icon: '💬' },
    { value: 'onboarding', label: '引導體驗', icon: '🎯' },
    { value: 'performance', label: '性能問題', icon: '⚡' }
  ]

  const severityLevels = [
    { value: 'low', label: '低', color: 'text-green-600' },
    { value: 'medium', label: '中', color: 'text-yellow-600' },
    { value: 'high', label: '高', color: 'text-orange-600' },
    { value: 'critical', label: '緊急', color: 'text-red-600' }
  ]

  const categories = [
    'JSON 修復工具',
    'Pipeline 監控',
    '權限管理',
    '用戶界面',
    '性能問題',
    '文檔',
    'API',
    '其他'
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '請輸入標題'
    }
    if (!formData.description.trim()) {
      newErrors.description = '請輸入詳細描述'
    }
    if (formData.description.length < 10) {
      newErrors.description = '描述至少需要10個字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const feedbackData = {
        userId,
        type: formData.type,
        category: formData.category || '其他',
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        priority: formData.severity === 'critical' ? 'urgent' : 'medium' as any,
        userType,
        userEmail: '', // 可以從用戶資料獲取
        userAgent: navigator.userAgent,
        pageUrl: window.location.href,
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other',
        os: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString(),
        rating: formData.rating,
        satisfaction: formData.satisfaction,
        tags: [],
        attachments: []
      }

      await submitFeedback(feedbackData)
      onSuccess?.()
    } catch (error) {
      console.error('提交反饋失敗:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">提交反饋</h2>
        <p className="text-gray-600">您的反饋對我們很重要，幫助我們持續改進 Tool Zoo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 反饋類型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            反饋類型 *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {feedbackTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('type', type.value)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-lg mb-1">{type.icon}</div>
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 分類 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分類
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">選擇分類</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* 標題 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            標題 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="簡潔描述您的反饋"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* 詳細描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            詳細描述 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={5}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="請詳細描述您的問題、建議或體驗..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/1000 字符
          </p>
        </div>

        {/* 嚴重程度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            嚴重程度
          </label>
          <div className="flex gap-3">
            {severityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleInputChange('severity', level.value)}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  formData.severity === level.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className={`font-medium ${level.color}`}>
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 評分 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              整體評分 (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange('rating', star)}
                  className={`text-2xl ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {formData.rating}/5 星
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              滿意度 (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.satisfaction}
              onChange={(e) => handleInputChange('satisfaction', parseInt(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.satisfaction}/10
            </p>
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '提交中...' : '提交反饋'}
          </button>
        </div>
      </form>
    </div>
  )
}

