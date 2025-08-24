/**
 * 用戶引導系統
 * 提供從 No-Code 平台用戶到 Tool Zoo 的無縫升級體驗
 */

export interface OnboardingStep {
  id: string
  title: string
  description: string
  type: 'welcome' | 'feature_intro' | 'interactive_tutorial' | 'customization' | 'completion'
  target: string // CSS selector 或路由
  content: {
    text: string
    image?: string
    video?: string
    actions?: Array<{
      label: string
      action: string
      url?: string
    }>
  }
  required: boolean
  completed: boolean
  order: number
}

export interface UserJourney {
  id: string
  name: string
  description: string
  steps: OnboardingStep[]
  targetAudience: 'no-code_user' | 'developer' | 'enterprise' | 'all'
  estimatedTime: number // 分鐘
  prerequisites: string[]
}

export interface UserProgress {
  userId: string
  currentStep: string
  completedSteps: string[]
  skippedSteps: string[]
  startTime: string
  lastActivity: string
  totalTime: number // 分鐘
  satisfaction: number // 1-5
  feedback: string[]
}

export interface PersonalizedRecommendation {
  id: string
  type: 'feature' | 'tutorial' | 'template' | 'integration'
  title: string
  description: string
  reason: string
  priority: 'low' | 'medium' | 'high'
  estimatedValue: string
  actionUrl: string
  tags: string[]
}

/**
 * 用戶引導服務
 */
export class UserOnboardingService {
  private journeys: UserJourney[] = []
  private userProgress: Map<string, UserProgress> = new Map()
  private recommendations: Map<string, PersonalizedRecommendation[]> = new Map()

  constructor() {
    this.initializeJourneys()
  }

  /**
   * 初始化用戶旅程
   */
  private initializeJourneys(): void {
    this.journeys = [
      {
        id: 'no-code-to-toolzoo',
        name: '從 No-Code 到 Tool Zoo',
        description: '為 No-Code 平台用戶設計的無縫升級體驗',
        targetAudience: 'no-code_user',
        estimatedTime: 15,
        prerequisites: ['基本的互聯網使用經驗'],
        steps: [
          {
            id: 'welcome',
            title: '歡迎來到 Tool Zoo',
            description: '了解 Tool Zoo 如何幫助您升級 AI 工具使用體驗',
            type: 'welcome',
            target: '/',
            content: {
              text: 'Tool Zoo 是專為 AI 創業者設計的一站式解決方案。我們幫助您從簡單的 No-Code 工具升級到專業級的 AI 開發平台。',
              image: '/images/onboarding/welcome.png',
              actions: [
                { label: '開始探索', action: 'next' },
                { label: '了解更多', action: 'learn_more', url: '/about' }
              ]
            },
            required: true,
            completed: false,
            order: 1
          },
          {
            id: 'feature-overview',
            title: '核心功能介紹',
            description: '了解 Tool Zoo 的三個核心功能',
            type: 'feature_intro',
            target: '/features',
            content: {
              text: 'Tool Zoo 提供三個核心功能：Entitlements Sandbox（權限管理）、JSON-AI Salvage Kit（AI 輸出修復）、Pipeline Dashboard（AI 流程監控）。',
              image: '/images/onboarding/features.png',
              actions: [
                { label: '查看功能', action: 'navigate', url: '/features' },
                { label: '跳過', action: 'skip' }
              ]
            },
            required: false,
            completed: false,
            order: 2
          },
          {
            id: 'json-salvage-demo',
            title: 'JSON 修復工具演示',
            description: '體驗智能 JSON 修復功能',
            type: 'interactive_tutorial',
            target: '/features/salvage',
            content: {
              text: '試試我們的 JSON 修復工具！輸入一個有問題的 JSON，看看 AI 如何智能修復它。',
              video: '/videos/json-salvage-demo.mp4',
              actions: [
                { label: '開始體驗', action: 'navigate', url: '/features/salvage' },
                { label: '觀看演示', action: 'play_video' }
              ]
            },
            required: true,
            completed: false,
            order: 3
          },
          {
            id: 'pipeline-dashboard-intro',
            title: 'AI 流程監控',
            description: '了解如何監控和優化 AI 流程',
            type: 'feature_intro',
            target: '/features/dashboard',
            content: {
              text: 'Pipeline Dashboard 幫助您實時監控 AI 流程的性能、成本和用戶體驗。',
              image: '/images/onboarding/dashboard.png',
              actions: [
                { label: '查看儀表板', action: 'navigate', url: '/features/dashboard' },
                { label: '跳過', action: 'skip' }
              ]
            },
            required: false,
            completed: false,
            order: 4
          },
          {
            id: 'subscription-setup',
            title: '選擇適合的訂閱計劃',
            description: '根據您的需求選擇最適合的計劃',
            type: 'customization',
            target: '/pricing',
            content: {
              text: '我們提供免費、專業和企業三個等級的訂閱計劃。每個計劃都有不同的功能和限制。',
              image: '/images/onboarding/pricing.png',
              actions: [
                { label: '查看價格', action: 'navigate', url: '/pricing' },
                { label: '開始免費試用', action: 'start_trial' }
              ]
            },
            required: true,
            completed: false,
            order: 5
          },
          {
            id: 'completion',
            title: '恭喜！您已完成引導',
            description: '開始使用 Tool Zoo 提升您的 AI 開發效率',
            type: 'completion',
            target: '/features',
            content: {
              text: '您已經了解了 Tool Zoo 的核心功能。現在可以開始使用這些工具來提升您的 AI 開發效率了！',
              image: '/images/onboarding/completion.png',
              actions: [
                { label: '開始使用', action: 'navigate', url: '/features' },
                { label: '查看文檔', action: 'navigate', url: '/docs' }
              ]
            },
            required: true,
            completed: false,
            order: 6
          }
        ]
      },
      {
        id: 'developer-quickstart',
        name: '開發者快速上手',
        description: '為開發者設計的快速功能熟悉流程',
        targetAudience: 'developer',
        estimatedTime: 10,
        prerequisites: ['基本的開發經驗'],
        steps: [
          {
            id: 'dev-welcome',
            title: '開發者專用引導',
            description: '快速了解 Tool Zoo 的技術架構和 API',
            type: 'welcome',
            target: '/',
            content: {
              text: '作為開發者，您可以直接使用我們的 API 和 SDK 來集成 Tool Zoo 的功能到您的應用中。',
              image: '/images/onboarding/dev-welcome.png',
              actions: [
                { label: '查看 API 文檔', action: 'navigate', url: '/api/docs' },
                { label: '下載 SDK', action: 'download_sdk' }
              ]
            },
            required: true,
            completed: false,
            order: 1
          }
        ]
      }
    ]
  }

  /**
   * 獲取用戶旅程
   */
  getJourney(userType: string): UserJourney | null {
    return this.journeys.find(j => j.targetAudience === userType || j.targetAudience === 'all') || null
  }

  /**
   * 開始用戶引導
   */
  startOnboarding(userId: string, userType: string): UserProgress {
    const journey = this.getJourney(userType)
    if (!journey) {
      throw new Error(`No journey found for user type: ${userType}`)
    }

    const progress: UserProgress = {
      userId,
      currentStep: journey.steps[0].id,
      completedSteps: [],
      skippedSteps: [],
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      totalTime: 0,
      satisfaction: 0,
      feedback: []
    }

    this.userProgress.set(userId, progress)
    return progress
  }

  /**
   * 完成步驟
   */
  completeStep(userId: string, stepId: string): void {
    const progress = this.userProgress.get(userId)
    if (!progress) return

    progress.completedSteps.push(stepId)
    progress.lastActivity = new Date().toISOString()
    
    // 更新當前步驟
    const journey = this.journeys.find(j => 
      j.steps.some(s => s.id === stepId)
    )
    if (journey) {
      const currentStepIndex = journey.steps.findIndex(s => s.id === stepId)
      const nextStep = journey.steps[currentStepIndex + 1]
      if (nextStep) {
        progress.currentStep = nextStep.id
      }
    }
  }

  /**
   * 跳過步驟
   */
  skipStep(userId: string, stepId: string): void {
    const progress = this.userProgress.get(userId)
    if (!progress) return

    progress.skippedSteps.push(stepId)
    progress.lastActivity = new Date().toISOString()
    
    // 更新當前步驟
    const journey = this.journeys.find(j => 
      j.steps.some(s => s.id === stepId)
    )
    if (journey) {
      const currentStepIndex = journey.steps.findIndex(s => s.id === stepId)
      const nextStep = journey.steps[currentStepIndex + 1]
      if (nextStep) {
        progress.currentStep = nextStep.id
      }
    }
  }

  /**
   * 獲取用戶進度
   */
  getUserProgress(userId: string): UserProgress | null {
    return this.userProgress.get(userId) || null
  }

  /**
   * 生成個性化推薦
   */
  generateRecommendations(userId: string, userBehavior: any): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = []

    // 基於用戶行為生成推薦
    if (userBehavior.featuresUsed?.includes('json_salvage_kit')) {
      recommendations.push({
        id: 'advanced-json-features',
        type: 'feature',
        title: '升級到高級 JSON 修復功能',
        description: '解鎖 AI 驅動的智能修復和成本優化建議',
        reason: '您經常使用 JSON 修復功能，升級可以獲得更好的修復效果',
        priority: 'high',
        estimatedValue: '提升 60% 修復成功率',
        actionUrl: '/features/salvage?upgrade=true',
        tags: ['json', 'ai', 'upgrade']
      })
    }

    if (userBehavior.subscription === 'free') {
      recommendations.push({
        id: 'pro-subscription',
        type: 'feature',
        title: '升級到專業版',
        description: '解鎖所有功能，獲得優先支持和更高使用限制',
        reason: '您已經使用了大部分免費功能，升級可以獲得更好的體驗',
        priority: 'medium',
        estimatedValue: '解鎖 11 個高級功能',
        actionUrl: '/pricing',
        tags: ['subscription', 'upgrade']
      })
    }

    if (userBehavior.apiUsage > 100) {
      recommendations.push({
        id: 'api-optimization',
        type: 'tutorial',
        title: 'API 使用優化指南',
        description: '學習如何優化 API 調用以降低成本和提高性能',
        reason: '您的 API 使用量較高，優化可以節省成本',
        priority: 'medium',
        estimatedValue: '節省 30% API 成本',
        actionUrl: '/docs/api-optimization',
        tags: ['api', 'optimization', 'cost']
      })
    }

    this.recommendations.set(userId, recommendations)
    return recommendations
  }

  /**
   * 提交用戶反饋
   */
  submitFeedback(userId: string, stepId: string, feedback: string, rating: number): void {
    const progress = this.userProgress.get(userId)
    if (!progress) return

    progress.feedback.push(`${stepId}: ${feedback}`)
    progress.satisfaction = rating
    progress.lastActivity = new Date().toISOString()
  }

  /**
   * 獲取引導統計
   */
  getOnboardingStats(): {
    totalUsers: number
    completionRate: number
    averageTime: number
    satisfactionScore: number
  } {
    const users = Array.from(this.userProgress.values())
    const completedUsers = users.filter(u => u.completedSteps.length > 0)
    
    return {
      totalUsers: users.length,
      completionRate: users.length > 0 ? (completedUsers.length / users.length) * 100 : 0,
      averageTime: users.length > 0 ? users.reduce((sum, u) => sum + u.totalTime, 0) / users.length : 0,
      satisfactionScore: users.length > 0 ? users.reduce((sum, u) => sum + u.satisfaction, 0) / users.length : 0
    }
  }
}

/**
 * 全局用戶引導服務實例
 */
export const userOnboardingService = new UserOnboardingService()

/**
 * 用戶引導 Hook
 */
export function useUserOnboarding(userId: string, userType: string) {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null)
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])

  useEffect(() => {
    // 獲取或創建用戶進度
    let userProgress = userOnboardingService.getUserProgress(userId)
    if (!userProgress) {
      userProgress = userOnboardingService.startOnboarding(userId, userType)
    }
    
    setProgress(userProgress)

    // 獲取當前步驟
    const journey = userOnboardingService.getJourney(userType)
    if (journey && userProgress) {
      const step = journey.steps.find(s => s.id === userProgress.currentStep)
      setCurrentStep(step || null)
    }

    // 生成推薦
    const userBehavior = {
      featuresUsed: ['json_salvage_kit'],
      subscription: 'free',
      apiUsage: 150
    }
    const recs = userOnboardingService.generateRecommendations(userId, userBehavior)
    setRecommendations(recs)
  }, [userId, userType])

  const completeStep = (stepId: string) => {
    userOnboardingService.completeStep(userId, stepId)
    setProgress(userOnboardingService.getUserProgress(userId))
  }

  const skipStep = (stepId: string) => {
    userOnboardingService.skipStep(userId, stepId)
    setProgress(userOnboardingService.getUserProgress(userId))
  }

  const submitFeedback = (stepId: string, feedback: string, rating: number) => {
    userOnboardingService.submitFeedback(userId, stepId, feedback, rating)
  }

  return {
    progress,
    currentStep,
    recommendations,
    completeStep,
    skipStep,
    submitFeedback
  }
}

// 需要在文件頂部添加 React 導入
import { useState, useEffect } from 'react'

