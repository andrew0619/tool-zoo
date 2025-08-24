/**
 * Google Analytics 配置和目標轉換設置
 * 提供完整的 GA4 配置和轉化追蹤
 */

export interface GAConfig {
  measurementId: string
  goals: ConversionGoal[]
  customDimensions: CustomDimension[]
  customMetrics: CustomMetric[]
  enhancedEcommerce: boolean
  userTiming: boolean
}

export interface ConversionGoal {
  id: string
  name: string
  type: 'destination' | 'event' | 'duration' | 'pages_per_session'
  value?: number
  conditions: GoalCondition[]
  isActive: boolean
}

export interface GoalCondition {
  type: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
  parameter: string
  value: string | number
}

export interface CustomDimension {
  id: string
  name: string
  scope: 'event' | 'user' | 'session'
  description: string
}

export interface CustomMetric {
  id: string
  name: string
  scope: 'event' | 'user' | 'session'
  type: 'integer' | 'float' | 'currency' | 'percent' | 'time'
  description: string
}

/**
 * Tool Zoo 的 Google Analytics 配置
 */
export const toolZooGAConfig: GAConfig = {
  measurementId: process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX',
  
  // 轉化目標
  goals: [
    {
      id: 'user_signup',
      name: '用戶註冊',
      type: 'event',
      conditions: [
        {
          type: 'equals',
          parameter: 'event_name',
          value: 'sign_up'
        }
      ],
      isActive: true
    },
    {
      id: 'subscription_purchase',
      name: '訂閱購買',
      type: 'event',
      conditions: [
        {
          type: 'equals',
          parameter: 'event_name',
          value: 'purchase'
        }
      ],
      isActive: true
    },
    {
      id: 'feature_usage',
      name: '功能使用',
      type: 'event',
      conditions: [
        {
          type: 'equals',
          parameter: 'event_category',
          value: 'feature_usage'
        }
      ],
      isActive: true
    },
    {
      id: 'blog_engagement',
      name: '博客互動',
      type: 'event',
      conditions: [
        {
          type: 'equals',
          parameter: 'event_category',
          value: 'engagement'
        }
      ],
      isActive: true
    },
    {
      id: 'page_view_goal',
      name: '頁面瀏覽目標',
      type: 'destination',
      conditions: [
        {
          type: 'contains',
          parameter: 'page_location',
          value: '/features'
        }
      ],
      isActive: true
    },
    {
      id: 'session_duration',
      name: '會話時長',
      type: 'duration',
      value: 300, // 5分鐘
      conditions: [],
      isActive: true
    }
  ],
  
  // 自定義維度
  customDimensions: [
    {
      id: 'user_tier',
      name: '用戶等級',
      scope: 'user',
      description: '用戶的訂閱等級 (free/pro/enterprise)'
    },
    {
      id: 'feature_used',
      name: '使用功能',
      scope: 'event',
      description: '用戶使用的具體功能'
    },
    {
      id: 'content_category',
      name: '內容分類',
      scope: 'event',
      description: '博客文章或內容的分類'
    },
    {
      id: 'conversion_source',
      name: '轉化來源',
      scope: 'event',
      description: '用戶轉化的來源渠道'
    },
    {
      id: 'error_type',
      name: '錯誤類型',
      scope: 'event',
      description: '系統錯誤的類型'
    }
  ],
  
  // 自定義指標
  customMetrics: [
    {
      id: 'json_repair_cost',
      name: 'JSON 修復成本',
      scope: 'event',
      type: 'currency',
      description: 'JSON 修復的實際成本'
    },
    {
      id: 'pipeline_response_time',
      name: 'Pipeline 響應時間',
      scope: 'event',
      type: 'time',
      description: 'Pipeline 的響應時間'
    },
    {
      id: 'feature_usage_count',
      name: '功能使用次數',
      scope: 'user',
      type: 'integer',
      description: '用戶使用功能的總次數'
    },
    {
      id: 'conversion_value',
      name: '轉化價值',
      scope: 'event',
      type: 'currency',
      description: '轉化事件的價值'
    },
    {
      id: 'user_satisfaction',
      name: '用戶滿意度',
      scope: 'event',
      type: 'percent',
      description: '用戶滿意度評分'
    }
  ],
  
  enhancedEcommerce: true,
  userTiming: true
}

/**
 * Google Analytics 目標轉換服務
 */
export class GAConversionService {
  private config: GAConfig

  constructor(config: GAConfig = toolZooGAConfig) {
    this.config = config
  }

  /**
   * 初始化 Google Analytics
   */
  initializeGA(): void {
    if (typeof window === 'undefined') return

    // 加載 GA4 腳本
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`
    document.head.appendChild(script)

    // 初始化 gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }

    // 配置 GA4
    window.gtag('js', new Date())
    window.gtag('config', this.config.measurementId, {
      // 基本配置
      page_title: document.title,
      page_location: window.location.href,
      
      // 自定義維度
      custom_map: {
        'user_tier': 'custom_user_property:user_tier',
        'feature_used': 'custom_parameter:feature_used',
        'content_category': 'custom_parameter:content_category',
        'conversion_source': 'custom_parameter:conversion_source',
        'error_type': 'custom_parameter:error_type'
      },
      
      // 自定義指標
      custom_metrics: {
        'json_repair_cost': 'custom_parameter:json_repair_cost',
        'pipeline_response_time': 'custom_parameter:pipeline_response_time',
        'feature_usage_count': 'custom_parameter:feature_usage_count',
        'conversion_value': 'custom_parameter:conversion_value',
        'user_satisfaction': 'custom_parameter:user_satisfaction'
      },
      
      // 增強型電子商務
      send_page_view: true,
      allow_google_signals: true,
      allow_ad_personalization_signals: true
    })
  }

  /**
   * 追蹤轉化目標
   */
  trackGoal(goalId: string, value?: number, parameters?: Record<string, any>): void {
    const goal = this.config.goals.find(g => g.id === goalId && g.isActive)
    if (!goal) return

    const eventData: any = {
      event_name: goal.name,
      value: value,
      custom_parameter: {
        goal_id: goalId,
        goal_type: goal.type,
        ...parameters
      }
    }

    // 根據目標類型發送不同的事件
    switch (goal.type) {
      case 'event':
        window.gtag('event', goal.name, eventData)
        break
      case 'destination':
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          ...eventData
        })
        break
      case 'duration':
        // 會話時長目標在 GA4 中自動追蹤
        break
      case 'pages_per_session':
        // 每會話頁面數目標在 GA4 中自動追蹤
        break
    }
  }

  /**
   * 追蹤用戶註冊
   */
  trackSignUp(method: string, userId: string, userTier: string = 'free'): void {
    window.gtag('event', 'sign_up', {
      method: method,
      user_id: userId,
      custom_user_property: {
        user_tier: userTier
      },
      custom_parameter: {
        conversion_source: 'website',
        signup_method: method
      }
    })

    // 追蹤轉化目標
    this.trackGoal('user_signup', 1, {
      signup_method: method,
      user_tier: userTier
    })
  }

  /**
   * 追蹤訂閱購買
   */
  trackPurchase(plan: string, value: number, currency: string = 'USD'): void {
    window.gtag('event', 'purchase', {
      currency: currency,
      value: value,
      items: [{
        item_id: plan,
        item_name: `${plan} Plan`,
        price: value,
        quantity: 1
      }],
      custom_parameter: {
        plan_type: plan,
        conversion_source: 'website'
      }
    })

    // 追蹤轉化目標
    this.trackGoal('subscription_purchase', value, {
      plan_type: plan,
      currency: currency
    })
  }

  /**
   * 追蹤功能使用
   */
  trackFeatureUsage(feature: string, action: string, cost?: number): void {
    window.gtag('event', 'feature_usage', {
      feature: feature,
      action: action,
      custom_parameter: {
        feature_name: feature,
        action_type: action,
        json_repair_cost: cost || 0
      }
    })

    // 追蹤轉化目標
    this.trackGoal('feature_usage', cost || 0, {
      feature_name: feature,
      action_type: action
    })
  }

  /**
   * 追蹤博客互動
   */
  trackBlogEngagement(action: string, contentId: string, category: string): void {
    window.gtag('event', 'blog_engagement', {
      action: action,
      content_id: contentId,
      custom_parameter: {
        content_category: category,
        engagement_type: action
      }
    })

    // 追蹤轉化目標
    this.trackGoal('blog_engagement', 1, {
      content_category: category,
      engagement_type: action
    })
  }

  /**
   * 追蹤錯誤
   */
  trackError(errorType: string, errorMessage: string, context?: Record<string, any>): void {
    window.gtag('event', 'error', {
      error_type: errorType,
      error_message: errorMessage,
      custom_parameter: {
        error_type: errorType,
        error_context: JSON.stringify(context || {})
      }
    })
  }

  /**
   * 設置用戶屬性
   */
  setUserProperty(key: string, value: any): void {
    window.gtag('config', this.config.measurementId, {
      custom_user_property: {
        [key]: value
      }
    })
  }

  /**
   * 追蹤用戶滿意度
   */
  trackUserSatisfaction(score: number, feature?: string): void {
    window.gtag('event', 'user_satisfaction', {
      satisfaction_score: score,
      custom_parameter: {
        user_satisfaction: score,
        feature_name: feature || 'overall'
      }
    })
  }

  /**
   * 追蹤 Pipeline 性能
   */
  trackPipelinePerformance(responseTime: number, success: boolean, cost?: number): void {
    window.gtag('event', 'pipeline_performance', {
      response_time: responseTime,
      success: success,
      custom_parameter: {
        pipeline_response_time: responseTime,
        pipeline_success: success,
        pipeline_cost: cost || 0
      }
    })
  }

  /**
   * 生成轉化報告
   */
  async generateConversionReport(timeRange: '1d' | '7d' | '30d' = '7d'): Promise<{
    totalConversions: number
    conversionRate: number
    goalBreakdown: Array<{
      goalId: string
      goalName: string
      conversions: number
      rate: number
      value: number
    }>
    topConvertingSources: Array<{
      source: string
      conversions: number
      rate: number
    }>
  }> {
    // 這裡可以調用 GA4 API 獲取實際數據
    // 目前返回模擬數據
    return {
      totalConversions: 156,
      conversionRate: 2.3,
      goalBreakdown: [
        {
          goalId: 'user_signup',
          goalName: '用戶註冊',
          conversions: 89,
          rate: 1.3,
          value: 0
        },
        {
          goalId: 'subscription_purchase',
          goalName: '訂閱購買',
          conversions: 23,
          rate: 0.3,
          value: 2300
        },
        {
          goalId: 'feature_usage',
          goalName: '功能使用',
          conversions: 44,
          rate: 0.7,
          value: 0
        }
      ],
      topConvertingSources: [
        {
          source: 'organic_search',
          conversions: 67,
          rate: 2.1
        },
        {
          source: 'direct',
          conversions: 45,
          rate: 1.8
        },
        {
          source: 'social',
          conversions: 34,
          rate: 1.2
        }
      ]
    }
  }
}

/**
 * 全局 GA 轉化服務實例
 */
export const gaConversion = new GAConversionService()

/**
 * React Hook 用於 GA 轉化追蹤
 */
export function useGAConversion() {
  return {
    trackGoal: (goalId: string, value?: number, parameters?: Record<string, any>) => 
      gaConversion.trackGoal(goalId, value, parameters),
    trackSignUp: (method: string, userId: string, userTier?: string) => 
      gaConversion.trackSignUp(method, userId, userTier),
    trackPurchase: (plan: string, value: number, currency?: string) => 
      gaConversion.trackPurchase(plan, value, currency),
    trackFeatureUsage: (feature: string, action: string, cost?: number) => 
      gaConversion.trackFeatureUsage(feature, action, cost),
    trackBlogEngagement: (action: string, contentId: string, category: string) => 
      gaConversion.trackBlogEngagement(action, contentId, category),
    trackError: (errorType: string, errorMessage: string, context?: Record<string, any>) => 
      gaConversion.trackError(errorType, errorMessage, context),
    setUserProperty: (key: string, value: any) => 
      gaConversion.setUserProperty(key, value),
    trackUserSatisfaction: (score: number, feature?: string) => 
      gaConversion.trackUserSatisfaction(score, feature),
    trackPipelinePerformance: (responseTime: number, success: boolean, cost?: number) => 
      gaConversion.trackPipelinePerformance(responseTime, success, cost)
  }
}

