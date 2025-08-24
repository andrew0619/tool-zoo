'use client'

import { useState, useEffect, useCallback } from 'react'

// 用戶行為追蹤
interface UserAction {
  type: string
  timestamp: number
  data?: any
}

// 智能提示配置
interface SmartTip {
  id: string
  title: string
  message: string
  condition: () => boolean
  shown: boolean
  priority: 'low' | 'medium' | 'high'
}

// 用戶偏好設置
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: boolean
  autoSave: boolean
  compactMode: boolean
}

export function useUX() {
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [smartTips, setSmartTips] = useState<SmartTip[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    language: 'zh-TW',
    notifications: true,
    autoSave: true,
    compactMode: false
  })
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)

  // 初始化用戶體驗
  useEffect(() => {
    // 檢查是否為首次訪問
    const hasVisited = localStorage.getItem('has-visited')
    if (!hasVisited) {
      setIsFirstVisit(true)
      localStorage.setItem('has-visited', 'true')
    }

    // 載入用戶偏好
    const savedPreferences = localStorage.getItem('user-preferences')
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }

    // 開始會話計時
    const startTime = Date.now()
    const interval = setInterval(() => {
      setSessionDuration(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 追蹤用戶行為
  const trackAction = useCallback((type: string, data?: any) => {
    const action: UserAction = {
      type,
      timestamp: Date.now(),
      data
    }
    
    setUserActions(prev => [...prev, action])
    
    // 發送到分析服務
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', type, data)
    }
  }, [])

  // 智能提示系統
  const addSmartTip = useCallback((tip: Omit<SmartTip, 'shown'>) => {
    setSmartTips(prev => [...prev, { ...tip, shown: false }])
  }, [])

  const markTipAsShown = useCallback((tipId: string) => {
    setSmartTips(prev => 
      prev.map(tip => 
        tip.id === tipId ? { ...tip, shown: true } : tip
      )
    )
  }, [])

  const getAvailableTips = useCallback(() => {
    return smartTips.filter(tip => !tip.shown && tip.condition())
  }, [smartTips])

  // 用戶偏好管理
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    localStorage.setItem('user-preferences', JSON.stringify(newPreferences))
    
    // 追蹤偏好變更
    trackAction('preferences_updated', updates)
  }, [preferences, trackAction])

  // 智能建議系統
  const getSuggestions = useCallback(() => {
    const suggestions: string[] = []
    
    // 基於使用時間的建議
    if (sessionDuration > 300000) { // 5分鐘
      suggestions.push('您已經使用了一段時間，建議休息一下')
    }
    
    // 基於用戶行為的建議
    const recentActions = userActions.slice(-10)
    const featureUsage = recentActions.filter(action => 
      action.type.startsWith('feature_')
    ).length
    
    if (featureUsage < 2) {
      suggestions.push('嘗試探索更多功能來提升效率')
    }
    
    return suggestions
  }, [sessionDuration, userActions])

  // 錯誤處理優化
  const handleError = useCallback((error: Error, context?: string) => {
    // 記錄錯誤
    trackAction('error_occurred', {
      message: error.message,
      stack: error.stack,
      context
    })
    
    // 根據錯誤類型提供建議
    const suggestions: string[] = []
    
    if (error.message.includes('network')) {
      suggestions.push('請檢查網絡連接')
    } else if (error.message.includes('permission')) {
      suggestions.push('請確認您有足夠的權限')
    } else if (error.message.includes('validation')) {
      suggestions.push('請檢查輸入數據格式')
    }
    
    return suggestions
  }, [trackAction])

  // 性能監控
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now()
    fn()
    const duration = performance.now() - start
    
    trackAction('performance_measure', { name, duration })
    
    return duration
  }, [trackAction])

  // 用戶滿意度追蹤
  const trackSatisfaction = useCallback((rating: number, feedback?: string) => {
    trackAction('satisfaction_rating', { rating, feedback })
  }, [trackAction])

  // 功能使用追蹤
  const trackFeatureUsage = useCallback((feature: string, details?: any) => {
    trackAction(`feature_${feature}`, details)
  }, [trackAction])

  // 頁面訪問追蹤
  const trackPageView = useCallback((page: string) => {
    trackAction('page_view', { page })
  }, [trackAction])

  // 用戶流程追蹤
  const trackUserFlow = useCallback((step: string, flow: string) => {
    trackAction('user_flow', { step, flow })
  }, [trackAction])

  // 智能預載入
  const preloadResources = useCallback((resources: string[]) => {
    resources.forEach(resource => {
      if (resource.endsWith('.css')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = resource
        document.head.appendChild(link)
      } else if (resource.endsWith('.js')) {
        const script = document.createElement('script')
        script.src = resource
        script.async = true
        document.head.appendChild(script)
      }
    })
  }, [])

  // 用戶體驗指標
  const getUXMetrics = useCallback(() => {
    const totalActions = userActions.length
    const sessionMinutes = Math.floor(sessionDuration / 60000)
    const actionsPerMinute = sessionMinutes > 0 ? totalActions / sessionMinutes : 0
    
    return {
      sessionDuration: sessionMinutes,
      totalActions,
      actionsPerMinute,
      isFirstVisit,
      availableTips: getAvailableTips().length,
      suggestions: getSuggestions()
    }
  }, [userActions, sessionDuration, isFirstVisit, getAvailableTips, getSuggestions])

  // 智能緩存管理
  const manageCache = useCallback(() => {
    // 清理舊的用戶行為數據
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    setUserActions(prev => 
      prev.filter(action => action.timestamp > oneDayAgo)
    )
    
    // 清理過期的智能提示
    setSmartTips(prev => 
      prev.filter(tip => !tip.shown || tip.priority === 'high')
    )
  }, [])

  // 定期清理
  useEffect(() => {
    const interval = setInterval(manageCache, 5 * 60 * 1000) // 每5分鐘
    return () => clearInterval(interval)
  }, [manageCache])

  return {
    // 追蹤功能
    trackAction,
    trackFeatureUsage,
    trackPageView,
    trackUserFlow,
    trackSatisfaction,
    
    // 智能提示
    addSmartTip,
    markTipAsShown,
    getAvailableTips,
    
    // 用戶偏好
    preferences,
    updatePreferences,
    
    // 錯誤處理
    handleError,
    
    // 性能監控
    measurePerformance,
    
    // 資源管理
    preloadResources,
    
    // 指標和狀態
    getUXMetrics,
    isFirstVisit,
    sessionDuration,
    
    // 用戶行為數據
    userActions
  }
}

// 特定功能的 UX Hook
export function useFeatureUX(featureName: string) {
  const { trackFeatureUsage, trackAction } = useUX()
  
  const trackStart = useCallback(() => {
    trackFeatureUsage(`${featureName}_start`)
  }, [featureName, trackFeatureUsage])
  
  const trackComplete = useCallback((result?: any) => {
    trackFeatureUsage(`${featureName}_complete`, result)
  }, [featureName, trackFeatureUsage])
  
  const trackError = useCallback((error: Error) => {
    trackAction(`${featureName}_error`, { message: error.message })
  }, [featureName, trackAction])
  
  return {
    trackStart,
    trackComplete,
    trackError
  }
}

// 表單 UX Hook
export function useFormUX(formName: string) {
  const { trackAction } = useUX()
  
  const trackFieldChange = useCallback((field: string, value: any) => {
    trackAction(`${formName}_field_change`, { field, value })
  }, [formName, trackAction])
  
  const trackValidation = useCallback((field: string, isValid: boolean) => {
    trackAction(`${formName}_validation`, { field, isValid })
  }, [formName, trackAction])
  
  const trackSubmit = useCallback((data: any) => {
    trackAction(`${formName}_submit`, data)
  }, [formName, trackAction])
  
  return {
    trackFieldChange,
    trackValidation,
    trackSubmit
  }
}

