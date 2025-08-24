/**
 * JSON-AI Salvage Kit 批量處理功能
 * 支持批量 JSON 修復和處理
 */

import { smartSalvageJSON, SalvageResult, SalvageStrategy } from './json-salvage-strategies'

export interface BatchSalvageJob {
  id: string
  name: string
  description?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  totalItems: number
  completedItems: number
  failedItems: number
  successfulItems: number
  
  // 配置
  tier: 'free' | 'pro' | 'enterprise'
  maxCost: number
  strategy: 'auto' | 'basic' | 'intermediate' | 'advanced' | 'ai_powered'
  parallelProcessing: boolean
  maxConcurrency: number
  
  // 數據
  items: BatchSalvageItem[]
  results: BatchSalvageResult[]
  errors: Array<{
    itemId: string
    error: string
    timestamp: string
  }>
  
  // 統計
  totalCost: number
  averageProcessingTime: number
  successRate: number
  
  // 元數據
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
}

export interface BatchSalvageItem {
  id: string
  originalJson: string
  expectedSchema?: string
  priority: 'low' | 'medium' | 'high'
  tags?: string[]
  metadata?: Record<string, any>
}

export interface BatchSalvageResult {
  itemId: string
  original: string
  repaired: string
  success: boolean
  errorMessage?: string
  appliedStrategies: string[]
  confidence: number
  cost: number
  processingTime: number
  timestamp: string
}

export interface BatchSalvageConfig {
  maxConcurrency: number
  retryAttempts: number
  retryDelay: number
  timeout: number
  costLimit: number
  qualityThreshold: number
}

/**
 * 批量處理服務
 */
export class BatchSalvageService {
  private jobs: BatchSalvageJob[] = []
  private defaultConfig: BatchSalvageConfig = {
    maxConcurrency: 5,
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 30000,
    costLimit: 1.0,
    qualityThreshold: 0.8
  }

  /**
   * 創建批量修復任務
   */
  async createBatchJob(
    name: string,
    items: Omit<BatchSalvageItem, 'id'>[],
    config: Partial<BatchSalvageJob> = {}
  ): Promise<BatchSalvageJob> {
    const job: BatchSalvageJob = {
      id: `batch-${Date.now()}`,
      name,
      status: 'pending',
      progress: 0,
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      successfulItems: 0,
      tier: 'free',
      maxCost: 0.01,
      strategy: 'auto',
      parallelProcessing: true,
      maxConcurrency: 5,
      items: items.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`
      })),
      results: [],
      errors: [],
      totalCost: 0,
      averageProcessingTime: 0,
      successRate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...config
    }

    this.jobs.push(job)
    return job
  }

  /**
   * 開始執行批量任務
   */
  async startBatchJob(jobId: string): Promise<void> {
    const job = this.jobs.find(j => j.id === jobId)
    if (!job) throw new Error(`Job ${jobId} not found`)

    if (job.status !== 'pending') {
      throw new Error(`Job ${jobId} is not in pending status`)
    }

    job.status = 'processing'
    job.started_at = new Date().toISOString()
    job.updated_at = new Date().toISOString()

    if (job.parallelProcessing) {
      await this.processBatchJobParallel(job)
    } else {
      await this.processBatchJobSequential(job)
    }
  }

  /**
   * 並行處理批量任務
   */
  private async processBatchJobParallel(job: BatchSalvageJob): Promise<void> {
    const chunks = this.chunkArray(job.items, job.maxConcurrency)
    
    for (const chunk of chunks) {
      const promises = chunk.map(item => this.processSingleItem(job, item))
      await Promise.allSettled(promises)
      
      // 更新進度
      job.progress = (job.completedItems / job.totalItems) * 100
      job.updated_at = new Date().toISOString()
    }
    
    this.finalizeJob(job)
  }

  /**
   * 順序處理批量任務
   */
  private async processBatchJobSequential(job: BatchSalvageJob): Promise<void> {
    for (const item of job.items) {
      await this.processSingleItem(job, item)
      
      // 更新進度
      job.progress = (job.completedItems / job.totalItems) * 100
      job.updated_at = new Date().toISOString()
    }
    
    this.finalizeJob(job)
  }

  /**
   * 處理單個項目
   */
  private async processSingleItem(job: BatchSalvageJob, item: BatchSalvageItem): Promise<void> {
    try {
      const startTime = Date.now()
      
      // 執行修復
      const result = await smartSalvageJSON(
        item.originalJson,
        job.tier,
        job.maxCost / job.totalItems // 平均分配成本
      )
      
      const processingTime = Date.now() - startTime
      
      // 創建結果
      const salvageResult: BatchSalvageResult = {
        itemId: item.id,
        original: item.originalJson,
        repaired: result.repaired,
        success: result.success,
        errorMessage: result.errorMessage,
        appliedStrategies: result.appliedStrategies,
        confidence: result.confidence,
        cost: result.cost,
        processingTime,
        timestamp: new Date().toISOString()
      }
      
      job.results.push(salvageResult)
      job.completedItems++
      job.totalCost += result.cost
      
      if (result.success) {
        job.successfulItems++
      } else {
        job.failedItems++
        job.errors.push({
          itemId: item.id,
          error: result.errorMessage || 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }
      
    } catch (error) {
      job.completedItems++
      job.failedItems++
      job.errors.push({
        itemId: item.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * 完成任務
   */
  private finalizeJob(job: BatchSalvageJob): void {
    job.status = 'completed'
    job.completed_at = new Date().toISOString()
    job.updated_at = new Date().toISOString()
    
    // 計算統計數據
    job.successRate = job.totalItems > 0 ? (job.successfulItems / job.totalItems) * 100 : 0
    job.averageProcessingTime = job.results.length > 0 ? 
      job.results.reduce((sum, r) => sum + r.processingTime, 0) / job.results.length : 0
  }

  /**
   * 獲取批量任務列表
   */
  async getBatchJobs(): Promise<BatchSalvageJob[]> {
    return this.jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  /**
   * 獲取單個批量任務
   */
  async getBatchJob(jobId: string): Promise<BatchSalvageJob | null> {
    return this.jobs.find(j => j.id === jobId) || null
  }

  /**
   * 取消批量任務
   */
  async cancelBatchJob(jobId: string): Promise<boolean> {
    const job = this.jobs.find(j => j.id === jobId)
    if (!job) return false

    if (job.status === 'processing') {
      job.status = 'cancelled'
      job.updated_at = new Date().toISOString()
      return true
    }

    return false
  }

  /**
   * 刪除批量任務
   */
  async deleteBatchJob(jobId: string): Promise<boolean> {
    const index = this.jobs.findIndex(j => j.id === jobId)
    if (index === -1) return false

    this.jobs.splice(index, 1)
    return true
  }

  /**
   * 獲取批量任務統計
   */
  async getBatchJobStats(): Promise<{
    totalJobs: number
    completedJobs: number
    failedJobs: number
    averageSuccessRate: number
    totalCost: number
    averageProcessingTime: number
  }> {
    const completedJobs = this.jobs.filter(j => j.status === 'completed')
    
    return {
      totalJobs: this.jobs.length,
      completedJobs: completedJobs.length,
      failedJobs: this.jobs.filter(j => j.status === 'failed').length,
      averageSuccessRate: completedJobs.length > 0 ? 
        completedJobs.reduce((sum, j) => sum + j.successRate, 0) / completedJobs.length : 0,
      totalCost: this.jobs.reduce((sum, j) => sum + j.totalCost, 0),
      averageProcessingTime: completedJobs.length > 0 ?
        completedJobs.reduce((sum, j) => sum + j.averageProcessingTime, 0) / completedJobs.length : 0
    }
  }

  /**
   * 批量驗證 JSON
   */
  async validateBatchJson(items: BatchSalvageItem[]): Promise<Array<{
    itemId: string
    isValid: boolean
    errors: string[]
  }>> {
    return items.map(item => {
      const errors: string[] = []
      let isValid = true

      try {
        JSON.parse(item.originalJson)
      } catch (error) {
        isValid = false
        errors.push(error instanceof Error ? error.message : 'Invalid JSON')
      }

      return {
        itemId: item.id,
        isValid,
        errors
      }
    })
  }

  /**
   * 批量分析 JSON 結構
   */
  async analyzeBatchJsonStructure(items: BatchSalvageItem[]): Promise<Array<{
    itemId: string
    structure: {
      type: 'object' | 'array' | 'primitive'
      depth: number
      keyCount?: number
      arrayLength?: number
      hasNestedObjects: boolean
      hasNestedArrays: boolean
    }
  }>> {
    return items.map(item => {
      try {
        const parsed = JSON.parse(item.originalJson)
        return {
          itemId: item.id,
          structure: this.analyzeJsonStructure(parsed)
        }
      } catch {
        return {
          itemId: item.id,
          structure: {
            type: 'primitive',
            depth: 0,
            hasNestedObjects: false,
            hasNestedArrays: false
          }
        }
      }
    })
  }

  /**
   * 分析 JSON 結構
   */
  private analyzeJsonStructure(obj: any, depth: number = 0): {
    type: 'object' | 'array' | 'primitive'
    depth: number
    keyCount?: number
    arrayLength?: number
    hasNestedObjects: boolean
    hasNestedArrays: boolean
  } {
    if (Array.isArray(obj)) {
      const nestedAnalysis = obj.map(item => this.analyzeJsonStructure(item, depth + 1))
      return {
        type: 'array',
        depth,
        arrayLength: obj.length,
        hasNestedObjects: nestedAnalysis.some(a => a.type === 'object' || a.hasNestedObjects),
        hasNestedArrays: nestedAnalysis.some(a => a.type === 'array' || a.hasNestedArrays)
      }
    } else if (typeof obj === 'object' && obj !== null) {
      const nestedAnalysis = Object.values(obj).map(value => this.analyzeJsonStructure(value, depth + 1))
      return {
        type: 'object',
        depth,
        keyCount: Object.keys(obj).length,
        hasNestedObjects: nestedAnalysis.some(a => a.type === 'object' || a.hasNestedObjects),
        hasNestedArrays: nestedAnalysis.some(a => a.type === 'array' || a.hasNestedArrays)
      }
    } else {
      return {
        type: 'primitive',
        depth,
        hasNestedObjects: false,
        hasNestedArrays: false
      }
    }
  }

  /**
   * 數組分塊
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 導出批量任務結果
   */
  async exportBatchJobResults(jobId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const job = await this.getBatchJob(jobId)
    if (!job) throw new Error(`Job ${jobId} not found`)

    if (format === 'csv') {
      return this.exportToCSV(job)
    } else {
      return JSON.stringify(job.results, null, 2)
    }
  }

  /**
   * 導出為 CSV
   */
  private exportToCSV(job: BatchSalvageJob): string {
    const headers = [
      'Item ID',
      'Success',
      'Processing Time (ms)',
      'Cost',
      'Confidence',
      'Applied Strategies',
      'Error Message'
    ]

    const rows = job.results.map(result => [
      result.itemId,
      result.success ? 'Yes' : 'No',
      result.processingTime,
      result.cost,
      result.confidence,
      result.appliedStrategies.join('; '),
      result.errorMessage || ''
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }
}

/**
 * 全局批量處理服務實例
 */
export const batchSalvageService = new BatchSalvageService()

