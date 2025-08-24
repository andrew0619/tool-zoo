/**
 * 電子郵件營銷系統
 * 提供用戶註冊、訂閱管理和自動化郵件發送功能
 */

export interface EmailSubscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: 'active' | 'unsubscribed' | 'pending'
  tags: string[]
  source: string
  subscribedAt: string
  lastEmailSent?: string
  metadata?: Record<string, any>
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  targetAudience: {
    tags?: string[]
    segments?: string[]
    filters?: Record<string, any>
  }
  scheduledAt?: string
  sentAt?: string
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  category: 'welcome' | 'newsletter' | 'promotional' | 'transactional'
  isActive: boolean
  created_at: string
  updated_at: string
}

export interface EmailAutomation {
  id: string
  name: string
  trigger: 'signup' | 'purchase' | 'inactive' | 'custom'
  conditions: Record<string, any>
  actions: Array<{
    type: 'send_email' | 'add_tag' | 'remove_tag' | 'delay'
    config: Record<string, any>
  }>
  isActive: boolean
  created_at: string
  updated_at: string
}

/**
 * 電子郵件營銷服務
 */
export class EmailMarketingService {
  private subscribers: EmailSubscriber[] = []
  private campaigns: EmailCampaign[] = []
  private templates: EmailTemplate[] = []
  private automations: EmailAutomation[] = []

  constructor() {
    this.initializeDefaultTemplates()
    this.initializeDefaultAutomations()
  }

  /**
   * 初始化默認郵件模板
   */
  private initializeDefaultTemplates(): void {
    this.templates = [
      {
        id: 'welcome-email',
        name: '歡迎郵件',
        subject: '歡迎加入 Tool Zoo！',
        content: `
          <h1>歡迎 {{firstName}}！</h1>
          <p>感謝您註冊 Tool Zoo，我們很高興您加入我們的社區。</p>
          <p>Tool Zoo 為 AI 創業者提供完整的技術解決方案：</p>
          <ul>
            <li>🎯 Entitlements Sandbox - 多租戶權限管理</li>
            <li>🔧 JSON-AI Salvage Kit - 智能 JSON 修復</li>
            <li>📊 Pipeline Dashboard - AI 流程監控</li>
          </ul>
          <p>立即開始使用：<a href="{{loginUrl}}">登入您的帳戶</a></p>
          <p>如果您有任何問題，請隨時聯繫我們。</p>
        `,
        variables: ['firstName', 'loginUrl'],
        category: 'welcome',
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'weekly-newsletter',
        name: '週報',
        subject: 'Tool Zoo 週報 - {{week}}',
        content: `
          <h1>Tool Zoo 週報</h1>
          <p>本週精選內容：</p>
          <h2>📚 最新文章</h2>
          <ul>
            {{#each articles}}
            <li><a href="{{url}}">{{title}}</a></li>
            {{/each}}
          </ul>
          <h2>🚀 產品更新</h2>
          <p>{{productUpdates}}</p>
          <h2>💡 使用技巧</h2>
          <p>{{tips}}</p>
          <p>感謝您的支持！</p>
        `,
        variables: ['week', 'articles', 'productUpdates', 'tips'],
        category: 'newsletter',
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'feature-announcement',
        name: '功能發布',
        subject: '🎉 新功能發布：{{featureName}}',
        content: `
          <h1>🎉 新功能發布</h1>
          <h2>{{featureName}}</h2>
          <p>{{featureDescription}}</p>
          <h3>主要特性：</h3>
          <ul>
            {{#each features}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          <p><a href="{{tryNowUrl}}" class="button">立即試用</a></p>
          <p>我們期待聽到您的反饋！</p>
        `,
        variables: ['featureName', 'featureDescription', 'features', 'tryNowUrl'],
        category: 'promotional',
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  /**
   * 初始化默認自動化流程
   */
  private initializeDefaultAutomations(): void {
    this.automations = [
      {
        id: 'welcome-series',
        name: '歡迎系列',
        trigger: 'signup',
        conditions: {},
        actions: [
          {
            type: 'send_email',
            config: {
              templateId: 'welcome-email',
              delay: 0
            }
          },
          {
            type: 'delay',
            config: {
              duration: 24 * 60 * 60 * 1000 // 24小時
            }
          },
          {
            type: 'send_email',
            config: {
              templateId: 'feature-announcement',
              delay: 0
            }
          }
        ],
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'inactive-reminder',
        name: '不活躍提醒',
        trigger: 'inactive',
        conditions: {
          daysInactive: 7
        },
        actions: [
          {
            type: 'send_email',
            config: {
              templateId: 'feature-announcement',
              delay: 0
            }
          }
        ],
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  /**
   * 訂閱者管理
   */
  async addSubscriber(subscriber: Omit<EmailSubscriber, 'id' | 'subscribedAt'>): Promise<EmailSubscriber> {
    const newSubscriber: EmailSubscriber = {
      ...subscriber,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscribedAt: new Date().toISOString()
    }

    this.subscribers.push(newSubscriber)

    // 觸發註冊自動化
    await this.triggerAutomation('signup', newSubscriber)

    return newSubscriber
  }

  async getSubscribers(filters?: {
    status?: string
    tags?: string[]
    source?: string
  }): Promise<EmailSubscriber[]> {
    let filtered = this.subscribers

    if (filters?.status) {
      filtered = filtered.filter(s => s.status === filters.status)
    }

    if (filters?.tags) {
      filtered = filtered.filter(s => filters.tags!.some(tag => s.tags.includes(tag)))
    }

    if (filters?.source) {
      filtered = filtered.filter(s => s.source === filters.source)
    }

    return filtered
  }

  async updateSubscriber(id: string, updates: Partial<EmailSubscriber>): Promise<EmailSubscriber | null> {
    const subscriber = this.subscribers.find(s => s.id === id)
    if (!subscriber) return null

    Object.assign(subscriber, { ...updates, updated_at: new Date().toISOString() })
    return subscriber
  }

  async unsubscribe(email: string): Promise<boolean> {
    const subscriber = this.subscribers.find(s => s.email === email)
    if (!subscriber) return false

    subscriber.status = 'unsubscribed'
    return true
  }

  /**
   * 郵件模板管理
   */
  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.templates.push(newTemplate)
    return newTemplate
  }

  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    if (category) {
      return this.templates.filter(t => t.category === category)
    }
    return this.templates
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const template = this.templates.find(t => t.id === id)
    if (!template) return null

    Object.assign(template, { ...updates, updated_at: new Date().toISOString() })
    return template
  }

  /**
   * 郵件活動管理
   */
  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'stats' | 'created_at' | 'updated_at'>): Promise<EmailCampaign> {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.campaigns.push(newCampaign)
    return newCampaign
  }

  async getCampaigns(): Promise<EmailCampaign[]> {
    return this.campaigns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async sendCampaign(campaignId: string): Promise<boolean> {
    const campaign = this.campaigns.find(c => c.id === campaignId)
    if (!campaign || campaign.status !== 'draft') return false

    campaign.status = 'sending'
    campaign.updated_at = new Date().toISOString()

    // 獲取目標受眾
    const subscribers = await this.getTargetSubscribers(campaign.targetAudience)

    // 發送郵件
    for (const subscriber of subscribers) {
      try {
        await this.sendEmail(subscriber.email, campaign.subject, campaign.content)
        campaign.stats.sent++
      } catch (error) {
        campaign.stats.bounced++
      }
    }

    campaign.status = 'sent'
    campaign.sentAt = new Date().toISOString()
    campaign.updated_at = new Date().toISOString()

    return true
  }

  /**
   * 自動化流程管理
   */
  async createAutomation(automation: Omit<EmailAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<EmailAutomation> {
    const newAutomation: EmailAutomation = {
      ...automation,
      id: `automation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.automations.push(newAutomation)
    return newAutomation
  }

  async getAutomations(): Promise<EmailAutomation[]> {
    return this.automations
  }

  async triggerAutomation(trigger: string, subscriber: EmailSubscriber): Promise<void> {
    const automations = this.automations.filter(a => a.trigger === trigger && a.isActive)

    for (const automation of automations) {
      // 檢查條件
      if (!this.checkAutomationConditions(automation.conditions, subscriber)) {
        continue
      }

      // 執行動作
      for (const action of automation.actions) {
        await this.executeAutomationAction(action, subscriber)
      }
    }
  }

  /**
   * 內部方法
   */
  private async getTargetSubscribers(targetAudience: EmailCampaign['targetAudience']): Promise<EmailSubscriber[]> {
    let subscribers = this.subscribers.filter(s => s.status === 'active')

    if (targetAudience.tags) {
      subscribers = subscribers.filter(s => 
        targetAudience.tags!.some(tag => s.tags.includes(tag))
      )
    }

    if (targetAudience.segments) {
      // 實現分段邏輯
    }

    return subscribers
  }

  private async sendEmail(to: string, subject: string, content: string): Promise<void> {
    // 這裡可以整合 SendGrid、Mailgun 等郵件服務
    console.log(`Sending email to ${to}: ${subject}`)
    
    // 模擬發送延遲
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private checkAutomationConditions(conditions: Record<string, any>, subscriber: EmailSubscriber): boolean {
    // 實現條件檢查邏輯
    return true
  }

  private async executeAutomationAction(action: EmailAutomation['actions'][0], subscriber: EmailSubscriber): Promise<void> {
    switch (action.type) {
      case 'send_email':
        const template = this.templates.find(t => t.id === action.config.templateId)
        if (template) {
          const content = this.renderTemplate(template.content, {
            firstName: subscriber.firstName || 'User',
            email: subscriber.email
          })
          await this.sendEmail(subscriber.email, template.subject, content)
        }
        break
      case 'add_tag':
        if (action.config.tag && !subscriber.tags.includes(action.config.tag)) {
          subscriber.tags.push(action.config.tag)
        }
        break
      case 'remove_tag':
        if (action.config.tag) {
          subscriber.tags = subscriber.tags.filter(tag => tag !== action.config.tag)
        }
        break
      case 'delay':
        await new Promise(resolve => setTimeout(resolve, action.config.duration || 0))
        break
    }
  }

  private renderTemplate(content: string, variables: Record<string, any>): string {
    let rendered = content
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return rendered
  }

  /**
   * 統計和分析
   */
  async getEmailStats(timeRange: '1d' | '7d' | '30d' = '7d'): Promise<{
    totalSubscribers: number
    activeSubscribers: number
    totalCampaigns: number
    averageOpenRate: number
    averageClickRate: number
    topPerformingCampaigns: Array<{
      name: string
      openRate: number
      clickRate: number
    }>
  }> {
    const activeSubscribers = this.subscribers.filter(s => s.status === 'active').length
    const totalCampaigns = this.campaigns.length

    return {
      totalSubscribers: this.subscribers.length,
      activeSubscribers,
      totalCampaigns,
      averageOpenRate: 25.5, // 模擬數據
      averageClickRate: 3.2, // 模擬數據
      topPerformingCampaigns: this.campaigns
        .filter(c => c.status === 'sent')
        .map(c => ({
          name: c.name,
          openRate: Math.random() * 50 + 10,
          clickRate: Math.random() * 10 + 1
        }))
        .sort((a, b) => b.openRate - a.openRate)
        .slice(0, 5)
    }
  }
}

/**
 * 全局電子郵件營銷服務實例
 */
export const emailMarketing = new EmailMarketingService()

