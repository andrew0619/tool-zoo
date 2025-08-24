'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingGuideProps {
  steps: OnboardingStep[]
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
  userId?: string
}

export function OnboardingGuide({ 
  steps, 
  isVisible, 
  onComplete, 
  onSkip,
  userId 
}: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isVisible && userId) {
      // 從 localStorage 恢復進度
      const saved = localStorage.getItem(`onboarding-${userId}`)
      if (saved) {
        const data = JSON.parse(saved)
        setCompletedSteps(new Set(data.completedSteps))
        setCurrentStep(data.currentStep)
      }
    }
  }, [isVisible, userId])

  const saveProgress = () => {
    if (userId) {
      localStorage.setItem(`onboarding-${userId}`, JSON.stringify({
        completedSteps: Array.from(completedSteps),
        currentStep
      }))
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const currentStepId = steps[currentStep].id
      setCompletedSteps(prev => new Set([...prev, currentStepId]))
      setCurrentStep(prev => prev + 1)
      saveProgress()
    } else {
      completeOnboarding()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      saveProgress()
    }
  }

  const completeOnboarding = () => {
    const allSteps = steps.map(step => step.id)
    setCompletedSteps(new Set(allSteps))
    saveProgress()
    onComplete()
  }

  const skipOnboarding = () => {
    onSkip()
  }

  if (!isVisible || currentStep >= steps.length) {
    return null
  }

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 進度條 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 rounded-t-lg"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 關閉按鈕 */}
        <button
          onClick={skipOnboarding}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 內容 */}
        <div className="p-6 pt-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-semibold text-lg">
                {currentStep + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* 步驟指示器 */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="mr-1" />
              上一步
            </button>

            <div className="flex space-x-2">
              {step.action && (
                <button
                  onClick={step.action.onClick}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {step.action.label}
                </button>
              )}
              
              <button
                onClick={nextStep}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check size={16} className="mr-1" />
                    完成
                  </>
                ) : (
                  <>
                    下一步
                    <ChevronRight size={16} className="ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 預定義的引導步驟
export const getDefaultOnboardingSteps = (): OnboardingStep[] => [
  {
    id: 'welcome',
    title: '歡迎使用 Tool Zoo',
    description: '讓我們花幾分鐘時間來了解 Tool Zoo 的核心功能，幫助您快速上手。',
    action: {
      label: '開始探索',
      onClick: () => {}
    }
  },
  {
    id: 'features',
    title: '核心功能',
    description: 'Tool Zoo 提供 JSON 修復、AI 文案生成、利潤分析等強大功能，幫助您提升工作效率。',
    action: {
      label: '查看功能',
      onClick: () => {
        window.location.href = '/features'
      }
    }
  },
  {
    id: 'health-check',
    title: '項目健康檢查',
    description: '實時監控您的項目健康狀況，包括性能、安全性、可靠性等多個維度。',
    action: {
      label: '開始檢查',
      onClick: () => {
        window.location.href = '/health-check'
      }
    }
  },
  {
    id: 'dashboard',
    title: '個人儀表板',
    description: '在儀表板中查看您的使用統計、項目狀態和個性化建議。',
    action: {
      label: '訪問儀表板',
      onClick: () => {
        window.location.href = '/dashboard'
      }
    }
  },
  {
    id: 'complete',
    title: '準備就緒！',
    description: '您已經了解了 Tool Zoo 的主要功能。現在可以開始使用這些強大的工具了！',
  }
]

