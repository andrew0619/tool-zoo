'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  OnboardingStep, 
  useUserOnboarding,
  PersonalizedRecommendation 
} from '@/lib/user-onboarding'

interface OnboardingModalProps {
  userId: string
  userType: string
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function OnboardingModal({ 
  userId, 
  userType, 
  isOpen, 
  onClose, 
  onComplete 
}: OnboardingModalProps) {
  const router = useRouter()
  const { 
    progress, 
    currentStep, 
    recommendations, 
    completeStep, 
    skipStep, 
    submitFeedback 
  } = useUserOnboarding(userId, userType)

  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(5)

  if (!isOpen || !currentStep) return null

  const handleAction = (action: string, url?: string) => {
    switch (action) {
      case 'next':
        completeStep(currentStep.id)
        break
      case 'skip':
        skipStep(currentStep.id)
        break
      case 'navigate':
        if (url) {
          router.push(url)
        }
        completeStep(currentStep.id)
        break
      case 'learn_more':
        if (url) {
          window.open(url, '_blank')
        }
        break
      case 'play_video':
        // 播放視頻邏輯
        break
      case 'start_trial':
        router.push('/pricing')
        completeStep(currentStep.id)
        break
      case 'download_sdk':
        // 下載 SDK 邏輯
        break
    }
  }

  const handleComplete = () => {
    if (showFeedback) {
      submitFeedback(currentStep.id, feedback, rating)
    }
    completeStep(currentStep.id)
    onComplete()
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return '🎉'
      case 'feature_intro':
        return '🚀'
      case 'interactive_tutorial':
        return '🎯'
      case 'customization':
        return '⚙️'
      case 'completion':
        return '✅'
      default:
        return '📝'
    }
  }

  const getProgressPercentage = () => {
    if (!progress) return 0
    const journey = userOnboardingService.getJourney(userType)
    if (!journey) return 0
    return (progress.completedSteps.length / journey.steps.length) * 100
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 進度條 */}
        <div className="bg-gray-100 rounded-t-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              步驟 {progress?.completedSteps.length || 0} / {userOnboardingService.getJourney(userType)?.steps.length || 0}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(getProgressPercentage())}% 完成
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* 內容區域 */}
        <div className="p-6">
          {/* 標題和圖標 */}
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">{getStepIcon(currentStep.type)}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentStep.title}</h2>
              <p className="text-sm text-gray-600">{currentStep.description}</p>
            </div>
          </div>

          {/* 主要內容 */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{currentStep.content.text}</p>
            
            {/* 圖片或視頻 */}
            {currentStep.content.image && (
              <div className="mb-4">
                <img 
                  src={currentStep.content.image} 
                  alt={currentStep.title}
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}
            
            {currentStep.content.video && (
              <div className="mb-4">
                <video 
                  src={currentStep.content.video}
                  controls
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}
          </div>

          {/* 操作按鈕 */}
          <div className="flex flex-wrap gap-3 mb-4">
            {currentStep.content.actions?.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action.action, action.url)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  action.action === 'next' || action.action === 'navigate'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : action.action === 'skip'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* 反饋區域 */}
          {showFeedback && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">請給我們一些反饋</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  評分 (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  意見反饋
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="請分享您的想法..."
                />
              </div>
            </div>
          )}

          {/* 個性化推薦 */}
          {recommendations.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">為您推薦</h3>
              <div className="space-y-3">
                {recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-blue-900">{rec.title}</h4>
                        <p className="text-sm text-blue-700 mt-1">{rec.description}</p>
                        <p className="text-xs text-blue-600 mt-1">{rec.reason}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-blue-600">{rec.estimatedValue}</span>
                      <button
                        onClick={() => router.push(rec.actionUrl)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        查看詳情
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            稍後再說
          </button>
          
          <div className="flex gap-2">
            {currentStep.type === 'completion' ? (
              <button
                onClick={handleComplete}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                完成引導
              </button>
            ) : (
              <>
                {!currentStep.required && (
                  <button
                    onClick={() => skipStep(currentStep.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    跳過
                  </button>
                )}
                <button
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showFeedback ? '隱藏反饋' : '提供反饋'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 需要導入 userOnboardingService
import { userOnboardingService } from '@/lib/user-onboarding'

