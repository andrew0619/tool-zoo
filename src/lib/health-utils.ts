import { HealthReport, HealthStatus, HealthCategory } from './types'

/**
 * 健康檢查工具類
 */
export class HealthUtils {
  
  /**
   * 計算健康分數的加權平均
   */
  static calculateWeightedScore(
    scores: Record<string, number>, 
    weights: Record<string, number> = {}
  ): number {
    const defaultWeights: Record<string, number> = {
      performance: 1.2,
      security: 1.5,
      reliability: 1.3,
      maintainability: 1.0,
      scalability: 1.1,
      testing: 1.2,
      documentation: 0.8,
      dependencies: 1.0,
      infrastructure: 1.1,
      monitoring: 1.0
    }

    const finalWeights = { ...defaultWeights, ...weights }
    
    let totalScore = 0
    let totalWeight = 0

    Object.entries(scores).forEach(([category, score]) => {
      const weight = finalWeights[category] || 1.0
      totalScore += score * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }

  /**
   * 根據分數確定健康狀態
   */
  static determineHealthStatus(score: number): HealthStatus {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'warning'
    if (score >= 40) return 'critical'
    return 'unknown'
  }

  /**
   * 獲取狀態對應的顏色類
   */
  static getStatusColorClass(status: HealthStatus): string {
    const colorMap: Record<HealthStatus, string> = {
      excellent: 'text-green-600 bg-green-100 border-green-200',
      good: 'text-blue-600 bg-blue-100 border-blue-200',
      warning: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      critical: 'text-red-600 bg-red-100 border-red-200',
      unknown: 'text-gray-600 bg-gray-100 border-gray-200'
    }
    return colorMap[status]
  }

  /**
   * 獲取狀態對應的圖標
   */
  static getStatusIcon(status: HealthStatus): string {
    const iconMap: Record<HealthStatus, string> = {
      excellent: '🟢',
      good: '🔵', 
      warning: '🟡',
      critical: '🔴',
      unknown: '⚪'
    }
    return iconMap[status]
  }

  /**
   * 獲取類別的中文名稱
   */
  static getCategoryDisplayName(category: HealthCategory): string {
    const nameMap: Record<HealthCategory, string> = {
      performance: '性能',
      security: '安全性',
      reliability: '可靠性', 
      maintainability: '可維護性',
      scalability: '可擴展性',
      testing: '測試',
      documentation: '文檔',
      dependencies: '依賴管理',
      infrastructure: '基礎設施',
      monitoring: '監控'
    }
    return nameMap[category] || category
  }

  /**
   * 生成健康報告摘要
   */
  static generateHealthSummary(report: HealthReport): {
    strengths: string[]
    weaknesses: string[]
    priorities: string[]
    trend: 'improving' | 'stable' | 'declining'
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const priorities: string[] = []

    // 分析各類別表現
    Object.entries(report.categories).forEach(([category, data]) => {
      const categoryName = this.getCategoryDisplayName(category as HealthCategory)
      
      if (data.score >= 85) {
        strengths.push(`${categoryName}表現優秀 (${data.score}/100)`)
      } else if (data.score < 60) {
        weaknesses.push(`${categoryName}需要改進 (${data.score}/100)`)
        
        if (data.score < 40) {
          priorities.push(`緊急處理${categoryName}問題`)
        }
      }
    })

    // 分析嚴重問題
    const criticalIssues = report.issues.filter(issue => issue.severity === 'critical')
    if (criticalIssues.length > 0) {
      priorities.unshift(`立即解決 ${criticalIssues.length} 個嚴重問題`)
    }

    // 確定趨勢（簡化版本）
    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (report.trends) {
      if (report.trends.scoreChange && report.trends.scoreChange > 5) {
        trend = 'improving'
      } else if (report.trends.scoreChange && report.trends.scoreChange < -5) {
        trend = 'declining'
      }
    }

    return {
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3), 
      priorities: priorities.slice(0, 3),
      trend
    }
  }

  /**
   * 計算改進潛力
   */
  static calculateImprovementPotential(report: HealthReport): {
    category: HealthCategory
    currentScore: number
    potentialScore: number
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
  }[] {
    const improvements: Array<{
      category: HealthCategory
      currentScore: number
      potentialScore: number
      impact: 'high' | 'medium' | 'low'
      effort: 'high' | 'medium' | 'low'
    }> = []

    Object.entries(report.categories).forEach(([category, data]) => {
      if (data.score < 85) {
        // 計算潛在改進分數
        const autoFixableIssues = report.issues.filter(
          issue => issue.category === category && issue.autoFixable
        ).length

        const potentialIncrease = Math.min(
          20, // 最大提升20分
          autoFixableIssues * 5 + (85 - data.score) * 0.3
        )

        const potentialScore = Math.min(100, data.score + potentialIncrease)

        // 評估影響和努力程度
        const impact = data.score < 50 ? 'high' : 
                      data.score < 70 ? 'medium' : 'low'
        
        const effort = autoFixableIssues > 2 ? 'low' :
                      data.score < 40 ? 'high' : 'medium'

        improvements.push({
          category: category as HealthCategory,
          currentScore: data.score,
          potentialScore,
          impact,
          effort
        })
      }
    })

    // 按影響和努力排序
    return improvements.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 }
      const effortWeight = { low: 3, medium: 2, high: 1 }
      
      const scoreA = impactWeight[a.impact] * effortWeight[a.effort]
      const scoreB = impactWeight[b.impact] * effortWeight[b.effort]
      
      return scoreB - scoreA
    })
  }

  /**
   * 生成健康檢查建議
   */
  static generateActionableRecommendations(report: HealthReport): {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  } {
    const immediate: string[] = []
    const shortTerm: string[] = []
    const longTerm: string[] = []

    // 立即行動 - 嚴重問題
    const criticalIssues = report.issues.filter(issue => issue.severity === 'critical')
    criticalIssues.forEach(issue => {
      if (issue.autoFixable) {
        immediate.push(`自動修復: ${issue.title}`)
      } else {
        immediate.push(`緊急處理: ${issue.title}`)
      }
    })

    // 短期改進 - 高影響低努力
    const improvements = this.calculateImprovementPotential(report)
    improvements
      .filter(imp => imp.impact === 'high' && imp.effort === 'low')
      .slice(0, 3)
      .forEach(imp => {
        shortTerm.push(
          `改進${this.getCategoryDisplayName(imp.category)}` +
          `（當前 ${imp.currentScore}，可達 ${imp.potentialScore}）`
        )
      })

    // 長期規劃 - 架構性改進
    Object.entries(report.categories).forEach(([category, data]) => {
      if (data.score < 70) {
        const categoryName = this.getCategoryDisplayName(category as HealthCategory)
        switch (category) {
          case 'scalability':
            longTerm.push(`重構架構以提升${categoryName}`)
            break
          case 'maintainability':
            longTerm.push(`建立代碼質量標準和審查流程`)
            break
          case 'monitoring':
            longTerm.push(`實施全面的監控和告警系統`)
            break
          case 'documentation':
            longTerm.push(`建立完整的文檔體系`)
            break
        }
      }
    })

    return {
      immediate: immediate.slice(0, 3),
      shortTerm: shortTerm.slice(0, 3),
      longTerm: longTerm.slice(0, 3)
    }
  }

  /**
   * 格式化健康報告為可讀文本
   */
  static formatReportSummary(report: HealthReport): string {
    const summary = this.generateHealthSummary(report)
    const recommendations = this.generateActionableRecommendations(report)

    let text = `# 項目健康報告\n\n`
    text += `**項目**: ${report.projectId}\n`
    text += `**檢查時間**: ${new Date(report.timestamp).toLocaleString('zh-TW')}\n`
    text += `**總體分數**: ${report.overallScore}/100 (${report.overallStatus})\n\n`

    text += `## 📊 概況\n`
    text += `- 總指標數: ${report.summary.totalMetrics}\n`
    text += `- 通過指標: ${report.summary.passedMetrics}\n`
    text += `- 警告指標: ${report.summary.warningMetrics}\n`
    text += `- 嚴重指標: ${report.summary.criticalMetrics}\n`
    text += `- 總問題數: ${report.summary.totalIssues}\n\n`

    if (summary.strengths.length > 0) {
      text += `## ✅ 優勢領域\n`
      summary.strengths.forEach(strength => {
        text += `- ${strength}\n`
      })
      text += '\n'
    }

    if (summary.weaknesses.length > 0) {
      text += `## ⚠️ 需要改進\n`
      summary.weaknesses.forEach(weakness => {
        text += `- ${weakness}\n`
      })
      text += '\n'
    }

    if (recommendations.immediate.length > 0) {
      text += `## 🚨 立即行動\n`
      recommendations.immediate.forEach(action => {
        text += `- ${action}\n`
      })
      text += '\n'
    }

    if (recommendations.shortTerm.length > 0) {
      text += `## 📋 短期改進\n`
      recommendations.shortTerm.forEach(action => {
        text += `- ${action}\n`
      })
      text += '\n'
    }

    return text
  }

  /**
   * 導出健康報告為 JSON
   */
  static exportReportAsJSON(report: HealthReport): string {
    return JSON.stringify(report, null, 2)
  }

  /**
   * 導出健康報告為 CSV
   */
  static exportReportAsCSV(report: HealthReport): string {
    let csv = 'Category,Metric,Score,Status,Value,Description\n'
    
    Object.entries(report.categories).forEach(([category, data]) => {
      data.metrics.forEach(metric => {
        csv += `"${category}","${metric.name}",${metric.score},"${metric.status}","${metric.value}","${metric.description}"\n`
      })
    })

    return csv
  }
}

