/**
 * 用戶反饋系統
 * 收集、分析和響應用戶反饋，持續改進產品體驗
 */

export interface UserFeedback {
  id: string
  userId: string
  type: 'bug_report' | 'feature_request' | 'general_feedback' | 'onboarding' | 'performance'
  category: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'in_review' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // 用戶信息
  userEmail?: string
  userType: 'free' | 'pro' | 'enterprise'
  userAgent: string
  pageUrl: string
  
  // 技術信息
  browser: string
  os: string
  screenSize: string
  timestamp: string
  
  // 評分和滿意度
  rating?: number // 1-5
  satisfaction?: number // 1-10
  
  // 管理信息
  assignedTo?: string
  tags: string[]
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface FeedbackAnalytics {
  totalFeedback: number
  averageRating: number
  satisfactionScore: number
  responseRate: number
  resolutionTime: number // 平均解決時間（小時）
  
  // 分類統計
  byType: Record<string, number>
  bySeverity: Record<string, number>
  byStatus: Record<string, number>
  
  // 趨勢數據
  dailyFeedback: Array<{
    date: string
    count: number
    averageRating: number
  }>
  
  // 熱門問題
  topIssues: Array<{
    category: string
    count: number
    avgRating: number
  }>
}

export interface FeedbackInsight {
  id: string
  type: 'trend' | 'pattern' | 'anomaly' | 'opportunity'
  title: string
  description: string
  confidence: number // 0-1
  impact: 'low' | 'medium' | 'high'
  recommendations: string[]
  data: any
  createdAt: string
}

/**
 * 用戶反饋服務
 */
export class UserFeedbackService {
  private feedback: UserFeedback[] = []
  private insights: FeedbackInsight[] = []

  /**
   * 提交反饋
   */
  async submitFeedback(feedbackData: Omit<UserFeedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserFeedback> {
    const feedback: UserFeedback = {
      ...feedbackData,
      id: `feedback-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.feedback.push(feedback)
    
    // 自動分析反饋
    await this.analyzeFeedback(feedback)
    
    // 如果是高優先級問題，發送通知
    if (feedback.priority === 'urgent' || feedback.severity === 'critical') {
      await this.sendUrgentNotification(feedback)
    }

    return feedback
  }

  /**
   * 獲取反饋列表
   */
  getFeedback(filters?: {
    type?: string
    status?: string
    severity?: string
    userId?: string
    dateRange?: { start: string; end: string }
  }): UserFeedback[] {
    let filtered = this.feedback

    if (filters?.type) {
      filtered = filtered.filter(f => f.type === filters.type)
    }
    if (filters?.status) {
      filtered = filtered.filter(f => f.status === filters.status)
    }
    if (filters?.severity) {
      filtered = filtered.filter(f => f.severity === filters.severity)
    }
    if (filters?.userId) {
      filtered = filtered.filter(f => f.userId === filters.userId)
    }
    if (filters?.dateRange) {
      filtered = filtered.filter(f => 
        f.createdAt >= filters.dateRange!.start && 
        f.createdAt <= filters.dateRange!.end
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * 更新反饋狀態
   */
  async updateFeedbackStatus(feedbackId: string, status: string, assignedTo?: string): Promise<void> {
    const feedback = this.feedback.find(f => f.id === feedbackId)
    if (feedback) {
      feedback.status = status as any
      feedback.assignedTo = assignedTo
      feedback.updatedAt = new Date().toISOString()
    }
  }

  /**
   * 獲取反饋分析
   */
  getFeedbackAnalytics(dateRange?: { start: string; end: string }): FeedbackAnalytics {
    const filteredFeedback = dateRange 
      ? this.feedback.filter(f => f.createdAt >= dateRange.start && f.createdAt <= dateRange.end)
      : this.feedback

    const totalFeedback = filteredFeedback.length
    const ratings = filteredFeedback.filter(f => f.rating).map(f => f.rating!)
    const satisfaction = filteredFeedback.filter(f => f.satisfaction).map(f => f.satisfaction!)

    // 分類統計
    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    filteredFeedback.forEach(f => {
      byType[f.type] = (byType[f.type] || 0) + 1
      bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1
      byStatus[f.status] = (byStatus[f.status] || 0) + 1
    })

    // 每日統計
    const dailyMap = new Map<string, { count: number; ratings: number[] }>()
    filteredFeedback.forEach(f => {
      const date = f.createdAt.split('T')[0]
      const existing = dailyMap.get(date) || { count: 0, ratings: [] }
      existing.count++
      if (f.rating) existing.ratings.push(f.rating)
      dailyMap.set(date, existing)
    })

    const dailyFeedback = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      averageRating: data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0
    })).sort((a, b) => a.date.localeCompare(b.date))

    // 熱門問題
    const categoryMap = new Map<string, { count: number; ratings: number[] }>()
    filteredFeedback.forEach(f => {
      const existing = categoryMap.get(f.category) || { count: 0, ratings: [] }
      existing.count++
      if (f.rating) existing.ratings.push(f.rating)
      categoryMap.set(f.category, existing)
    })

    const topIssues = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      avgRating: data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0
    })).sort((a, b) => b.count - a.count).slice(0, 10)

    return {
      totalFeedback,
      averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
      satisfactionScore: satisfaction.length > 0 ? satisfaction.reduce((a, b) => a + b, 0) / satisfaction.length : 0,
      responseRate: 0.95, // 模擬數據
      resolutionTime: 24, // 模擬數據
      byType,
      bySeverity,
      byStatus,
      dailyFeedback,
      topIssues
    }
  }

  /**
   * 生成反饋洞察
   */
  async generateInsights(): Promise<FeedbackInsight[]> {
    const analytics = this.getFeedbackAnalytics()
    const insights: FeedbackInsight[] = []

    // 趨勢分析
    if (analytics.dailyFeedback.length > 7) {
      const recent = analytics.dailyFeedback.slice(-7)
      const previous = analytics.dailyFeedback.slice(-14, -7)
      
      const recentAvg = recent.reduce((sum, day) => sum + day.count, 0) / recent.length
      const previousAvg = previous.reduce((sum, day) => sum + day.count, 0) / previous.length
      
      if (recentAvg > previousAvg * 1.2) {
        insights.push({
          id: `insight-${Date.now()}-1`,
          type: 'trend',
          title: '反饋量增加趨勢',
          description: `最近7天的反饋量比前7天增加了 ${Math.round((recentAvg / previousAvg - 1) * 100)}%`,
          confidence: 0.85,
          impact: 'medium',
          recommendations: [
            '檢查是否有新功能發布導致用戶困惑',
            '增加客服支持資源',
            '優化用戶引導流程'
          ],
          data: { recentAvg, previousAvg, increase: recentAvg / previousAvg },
          createdAt: new Date().toISOString()
        })
      }
    }

    // 滿意度分析
    if (analytics.averageRating < 4.0) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        type: 'pattern',
        title: '用戶滿意度偏低',
        description: `平均評分為 ${analytics.averageRating.toFixed(1)}/5，需要關注`,
        confidence: 0.9,
        impact: 'high',
        recommendations: [
          '分析低評分反饋的共同點',
          '優先解決高優先級問題',
          '改進用戶體驗設計'
        ],
        data: { averageRating: analytics.averageRating },
        createdAt: new Date().toISOString()
      })
    }

    // 熱門問題分析
    const topIssue = analytics.topIssues[0]
    if (topIssue && topIssue.count > 5) {
      insights.push({
        id: `insight-${Date.now()}-3`,
        type: 'opportunity',
        title: '熱門問題識別',
        description: `"${topIssue.category}" 是最常見的問題類型，共 ${topIssue.count} 次報告`,
        confidence: 0.95,
        impact: 'high',
        recommendations: [
          '優先開發解決方案',
          '更新相關文檔',
          '考慮功能重新設計'
        ],
        data: { category: topIssue.category, count: topIssue.count },
        createdAt: new Date().toISOString()
      })
    }

    this.insights = insights
    return insights
  }

  /**
   * 獲取洞察列表
   */
  getInsights(): FeedbackInsight[] {
    return this.insights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * 分析單個反饋
   */
  private async analyzeFeedback(feedback: UserFeedback): Promise<void> {
    // 自動標籤
    const tags: string[] = []
    
    if (feedback.description.toLowerCase().includes('bug') || feedback.description.toLowerCase().includes('error')) {
      tags.push('bug')
    }
    if (feedback.description.toLowerCase().includes('slow') || feedback.description.toLowerCase().includes('performance')) {
      tags.push('performance')
    }
    if (feedback.description.toLowerCase().includes('ui') || feedback.description.toLowerCase().includes('interface')) {
      tags.push('ui/ux')
    }
    if (feedback.description.toLowerCase().includes('feature') || feedback.description.toLowerCase().includes('request')) {
      tags.push('feature-request')
    }

    feedback.tags = [...new Set([...feedback.tags, ...tags])]

    // 自動設置優先級
    if (feedback.severity === 'critical' && feedback.priority !== 'urgent') {
      feedback.priority = 'urgent'
    }
  }

  /**
   * 發送緊急通知
   */
  private async sendUrgentNotification(feedback: UserFeedback): Promise<void> {
    // 這裡可以實現實際的通知邏輯
    console.log(`緊急通知: ${feedback.title} - ${feedback.description}`)
    
    // 示例：發送到 Slack
    // await fetch('/api/notifications/slack', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     channel: '#feedback-alerts',
    //     text: `🚨 緊急反饋: ${feedback.title}`,
    //     attachments: [{
    //       text: feedback.description,
    //       color: 'danger'
    //     }]
    //   })
    // })
  }

  /**
   * 獲取反饋統計
   */
  getFeedbackStats(): {
    total: number
    open: number
    resolved: number
    averageResponseTime: number
    satisfactionTrend: number
  } {
    const total = this.feedback.length
    const open = this.feedback.filter(f => f.status === 'new' || f.status === 'in_review' || f.status === 'in_progress').length
    const resolved = this.feedback.filter(f => f.status === 'resolved').length
    
    // 模擬數據
    const averageResponseTime = 2.5 // 小時
    const satisfactionTrend = 0.1 // 10% 提升

    return {
      total,
      open,
      resolved,
      averageResponseTime,
      satisfactionTrend
    }
  }
}

/**
 * 全局用戶反饋服務實例
 */
export const userFeedbackService = new UserFeedbackService()

/**
 * 用戶反饋 Hook
 */
export function useUserFeedback() {
  const [feedback, setFeedback] = useState<UserFeedback[]>([])
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null)
  const [insights, setInsights] = useState<FeedbackInsight[]>([])
  const [loading, setLoading] = useState(false)

  const submitFeedback = async (feedbackData: Omit<UserFeedback, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    try {
      const newFeedback = await userFeedbackService.submitFeedback(feedbackData)
      setFeedback(prev => [newFeedback, ...prev])
      return newFeedback
    } finally {
      setLoading(false)
    }
  }

  const getFeedback = (filters?: any) => {
    const filtered = userFeedbackService.getFeedback(filters)
    setFeedback(filtered)
    return filtered
  }

  const getAnalytics = (dateRange?: any) => {
    const analytics = userFeedbackService.getFeedbackAnalytics(dateRange)
    setAnalytics(analytics)
    return analytics
  }

  const generateInsights = async () => {
    setLoading(true)
    try {
      const newInsights = await userFeedbackService.generateInsights()
      setInsights(newInsights)
      return newInsights
    } finally {
      setLoading(false)
    }
  }

  return {
    feedback,
    analytics,
    insights,
    loading,
    submitFeedback,
    getFeedback,
    getAnalytics,
    generateInsights
  }
}

// 需要在文件頂部添加 React 導入
import { useState } from 'react'

