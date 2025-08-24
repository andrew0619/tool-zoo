'use client'

import Link from 'next/link'
import { Navigation } from '@/components/layout/Navigation'
import { OnboardingGuide, getDefaultOnboardingSteps } from '@/components/ui/OnboardingGuide'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // 檢查是否是新用戶
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setShowOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setShowOnboarding(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      {/* Hero Section - 簡化設計 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI創業者的
              <span className="text-blue-600">一盒化解決方案</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              單人友好、開箱即用、內含完整監控與分析
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/features"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              開始使用
            </Link>
            <Link
              href="/health-check"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200"
            >
              健康檢查
            </Link>
          </div>

                  {/* 快速功能卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">🔧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">JSON 修復</h3>
              <p className="text-sm text-gray-600">智能修復和驗證 JSON 數據</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI 文案</h3>
              <p className="text-sm text-gray-600">生成高質量營銷文案</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">利潤分析</h3>
              <p className="text-sm text-gray-600">深度分析產品利潤</p>
            </div>
          </div>
        </div>

        {/* 簡化的 CTA */}
        <div className="mt-16 bg-white/50 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-6">
            加入數千名開發者的行列，體驗 AI 驅動的開發工具
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            立即開始
          </Link>
        </div>
      </main>

      {/* 智能引導 */}
      <OnboardingGuide
        steps={getDefaultOnboardingSteps()}
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
        userId="new-user"
      />
    </div>
  )
}
