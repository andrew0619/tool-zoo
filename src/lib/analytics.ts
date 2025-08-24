/**
 * Google Analytics 和轉化追蹤系統
 * 提供完整的用戶行為分析和轉化追蹤
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

export interface ConversionEvent {
  event_name: string
  value?: number
  currency?: string
  items?: Array<{
    item_id: string
    item_name: string
    price?: number
    quantity?: number
  }>
  custom_parameters?: Record<string, any>
}

export interface UserBehavior {
  userId: string
  sessionId: string
  pageViews: Array<{
    page: string
    timestamp: string
    duration?: number
  }>
  events: Array<{
    action: string
    category: string
    timestamp: string
    parameters?: Record<string, any>
  }>
  conversions: Array<{
    event: string
    value?: number
    timestamp: string
  }>
  userProperties: Record<string, any>
}

/**
 * Analytics 服務
 */
export class AnalyticsService {
  private isInitialized = false
  private userId: string | null = null
  private sessionId: string | null = null
  private userBehavior: UserBehavior | null = null

  constructor() {
    this.initializeAnalytics()
  }

  /**
   * 初始化 Analytics
   */
  private initializeAnalytics(): void {
    if (typeof window === 'undefined') return

    // 初始化 Google Analytics
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }
      
      // 加載 Google Analytics 腳本
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
      document.head.appendChild(script)

      // 配置 GA
      window.gtag('js', new Date())
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }

    this.isInitialized = true
    this.generateSessionId()
  }

  /**
   * 生成會話 ID
   */
  private generateSessionId(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 設置用戶 ID
   */
  setUserId(userId: string): void {
    this.userId = userId
    
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        user_id: userId
      })
    }

    // 初始化用戶行為追蹤
    this.userBehavior = {
      userId,
      sessionId: this.sessionId!,
      pageViews: [],
      events: [],
      conversions: [],
      userProperties: {}
    }
  }

  /**
   * 追蹤頁面瀏覽
   */
  trackPageView(page: string, title?: string): void {
    if (!this.isInitialized) return

    const pageView = {
      page,
      timestamp: new Date().toISOString()
    }

    // 記錄到用戶行為
    if (this.userBehavior) {
      this.userBehavior.pageViews.push(pageView)
    }

    // 發送到 Google Analytics
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: title || document.title,
        page_location: page,
      })
    }

    // 發送到內部 API
    this.sendToInternalAPI('page_view', {
      page,
      title: title || document.title,
      userId: this.userId,
      sessionId: this.sessionId
    })
  }

  /**
   * 追蹤事件
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) return

    const eventData = {
      action: event.action,
      category: event.category,
      label: event.label,
      value: event.value,
      timestamp: new Date().toISOString(),
      parameters: event.custom_parameters
    }

    // 記錄到用戶行為
    if (this.userBehavior) {
      this.userBehavior.events.push(eventData)
    }

    // 發送到 Google Analytics
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters
      })
    }

    // 發送到內部 API
    this.sendToInternalAPI('event', {
      ...eventData,
      userId: this.userId,
      sessionId: this.sessionId
    })
  }

  /**
   * 追蹤轉化
   */
  trackConversion(conversion: ConversionEvent): void {
    if (!this.isInitialized) return

    const conversionData = {
      event: conversion.event_name,
      value: conversion.value,
      currency: conversion.currency || 'USD',
      timestamp: new Date().toISOString(),
      items: conversion.items,
      parameters: conversion.custom_parameters
    }

    // 記錄到用戶行為
    if (this.userBehavior) {
      this.userBehavior.conversions.push({
        event: conversion.event_name,
        value: conversion.value,
        timestamp: new Date().toISOString()
      })
    }

    // 發送到 Google Analytics
    if (window.gtag) {
      window.gtag('event', conversion.event_name, {
        value: conversion.value,
        currency: conversion.currency || 'USD',
        items: conversion.items,
        ...conversion.custom_parameters
      })
    }

    // 發送到內部 API
    this.sendToInternalAPI('conversion', {
      ...conversionData,
      userId: this.userId,
      sessionId: this.sessionId
    })
  }

  /**
   * 追蹤用戶屬性
   */
  setUserProperty(key: string, value: any): void {
    if (!this.isInitialized || !this.userBehavior) return

    this.userBehavior.userProperties[key] = value

    // 發送到 Google Analytics
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        custom_map: {
          [key]: value
        }
      })
    }
  }

  /**
   * 追蹤用戶註冊
   */
  trackSignUp(method: string, userId: string): void {
    this.trackEvent({
      action: 'sign_up',
      category: 'engagement',
      label: method,
      custom_parameters: {
        method,
        user_id: userId
      }
    })

    this.trackConversion({
      event_name: 'sign_up',
      custom_parameters: {
        method,
        user_id: userId
      }
    })
  }

  /**
   * 追蹤功能使用
   */
  trackFeatureUsage(feature: string, action: string, value?: number): void {
    this.trackEvent({
      action,
      category: 'feature_usage',
      label: feature,
      value,
      custom_parameters: {
        feature,
        action
      }
    })
  }

  /**
   * 追蹤訂閱轉化
   */
  trackSubscription(plan: string, value: number, currency: string = 'USD'): void {
    this.trackEvent({
      action: 'purchase',
      category: 'ecommerce',
      label: plan,
      value,
      custom_parameters: {
        plan,
        currency
      }
    })

    this.trackConversion({
      event_name: 'purchase',
      value,
      currency,
      items: [{
        item_id: plan,
        item_name: `${plan} Plan`,
        price: value,
        quantity: 1
      }],
      custom_parameters: {
        plan
      }
    })
  }

  /**
   * 追蹤錯誤
   */
  trackError(error: string, context?: Record<string, any>): void {
    this.trackEvent({
      action: 'error',
      category: 'system',
      label: error,
      custom_parameters: {
        error,
        context
      }
    })
  }

  /**
   * 獲取用戶行為數據
   */
  getUserBehavior(): UserBehavior | null {
    return this.userBehavior
  }

  /**
   * 發送到內部 API
   */
  private async sendToInternalAPI(type: string, data: any): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to send analytics data:', error)
    }
  }

  /**
   * 獲取轉化率統計
   */
  async getConversionStats(timeRange: '1d' | '7d' | '30d' = '7d'): Promise<{
    totalConversions: number
    conversionRate: number
    revenue: number
    topConvertingPages: Array<{
      page: string
      conversions: number
      rate: number
    }>
  }> {
    try {
      const response = await fetch(`/api/analytics/conversions?range=${timeRange}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to get conversion stats:', error)
      return {
        totalConversions: 0,
        conversionRate: 0,
        revenue: 0,
        topConvertingPages: []
      }
    }
  }

  /**
   * 獲取用戶行為分析
   */
  async getUserBehaviorAnalysis(timeRange: '1d' | '7d' | '30d' = '7d'): Promise<{
    totalUsers: number
    activeUsers: number
    averageSessionDuration: number
    topPages: Array<{
      page: string
      views: number
      uniqueViews: number
    }>
    topEvents: Array<{
      action: string
      category: string
      count: number
    }>
  }> {
    try {
      const response = await fetch(`/api/analytics/behavior?range=${timeRange}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to get user behavior analysis:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        averageSessionDuration: 0,
        topPages: [],
        topEvents: []
      }
    }
  }
}

/**
 * 全局 Analytics 服務實例
 */
export const analytics = new AnalyticsService()

/**
 * React Hook 用於 Analytics
 */
export function useAnalytics() {
  return {
    trackPageView: (page: string, title?: string) => analytics.trackPageView(page, title),
    trackEvent: (event: AnalyticsEvent) => analytics.trackEvent(event),
    trackConversion: (conversion: ConversionEvent) => analytics.trackConversion(conversion),
    trackSignUp: (method: string, userId: string) => analytics.trackSignUp(method, userId),
    trackFeatureUsage: (feature: string, action: string, value?: number) => 
      analytics.trackFeatureUsage(feature, action, value),
    trackSubscription: (plan: string, value: number, currency?: string) => 
      analytics.trackSubscription(plan, value, currency),
    trackError: (error: string, context?: Record<string, any>) => analytics.trackError(error, context),
    setUserProperty: (key: string, value: any) => analytics.setUserProperty(key, value),
    setUserId: (userId: string) => analytics.setUserId(userId)
  }
}

