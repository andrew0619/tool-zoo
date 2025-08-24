import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { handleSupabaseError } from '@/lib/error-handler'
import { HealthReport } from '@/lib/types'

interface ComparisonResult {
  baseline: HealthReport
  current: HealthReport
  changes: {
    overallScoreChange: number
    categoryChanges: Record<string, {
      scoreChange: number
      status: 'improved' | 'degraded' | 'unchanged'
      newIssues: number
      resolvedIssues: number
    }>
    newIssues: Array<{
      category: string
      title: string
      severity: string
    }>
    resolvedIssues: Array<{
      category: string
      title: string
      severity: string
    }>
  }
  summary: {
    improvementAreas: string[]
    regressionAreas: string[]
    recommendations: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baselineReportId, currentReportId, projectId } = body

    if (!baselineReportId || !currentReportId) {
      return NextResponse.json({
        success: false,
        error: '基線報告 ID 和當前報告 ID 都是必需的',
        code: 'MISSING_REPORT_IDS'
      }, { status: 400 })
    }

    // 獲取兩個報告
    const { data: reports, error } = await supabase
      .from('health_reports')
      .select('*')
      .in('id', [baselineReportId, currentReportId])

    if (error) {
      throw error
    }

    if (!reports || reports.length !== 2) {
      return NextResponse.json({
        success: false,
        error: '無法找到指定的健康檢查報告',
        code: 'REPORTS_NOT_FOUND'
      }, { status: 404 })
    }

    // 確定哪個是基線，哪個是當前
    const baseline = reports.find(r => r.id === baselineReportId)!
    const current = reports.find(r => r.id === currentReportId)!

    // 執行比較分析
    const comparison = await compareHealthReports(baseline, current)

    return NextResponse.json({
      success: true,
      data: comparison,
      message: '健康檢查報告比較完成'
    })

  } catch (error: unknown) {
    console.error('健康檢查比較 API 錯誤:', error)
    const appError = handleSupabaseError(error as Error)
    
    return NextResponse.json({
      success: false,
      error: appError.message,
      code: appError.code
    }, { status: 500 })
  }
}

async function compareHealthReports(
  baseline: HealthReport, 
  current: HealthReport
): Promise<ComparisonResult> {
  
  // 計算總體分數變化
  const overallScoreChange = current.overallScore - baseline.overallScore

  // 計算類別變化
  const categoryChanges: Record<string, any> = {}
  
  Object.keys(current.categories).forEach(category => {
    const baselineCategory = baseline.categories[category]
    const currentCategory = current.categories[category]
    
    if (baselineCategory && currentCategory) {
      const scoreChange = currentCategory.score - baselineCategory.score
      
      categoryChanges[category] = {
        scoreChange,
        status: scoreChange > 5 ? 'improved' : 
                scoreChange < -5 ? 'degraded' : 'unchanged',
        newIssues: 0, // 簡化實現
        resolvedIssues: 0 // 簡化實現
      }
    }
  })

  // 識別新問題和已解決問題
  const baselineIssueIds = new Set(baseline.issues.map(i => `${i.category}-${i.title}`))
  const currentIssueIds = new Set(current.issues.map(i => `${i.category}-${i.title}`))

  const newIssues = current.issues.filter(issue => 
    !baselineIssueIds.has(`${issue.category}-${issue.title}`)
  ).map(issue => ({
    category: issue.category,
    title: issue.title,
    severity: issue.severity
  }))

  const resolvedIssues = baseline.issues.filter(issue => 
    !currentIssueIds.has(`${issue.category}-${issue.title}`)
  ).map(issue => ({
    category: issue.category,
    title: issue.title,
    severity: issue.severity
  }))

  // 生成改進和退化區域
  const improvementAreas = Object.entries(categoryChanges)
    .filter(([_, change]) => change.status === 'improved')
    .map(([category, _]) => category)

  const regressionAreas = Object.entries(categoryChanges)
    .filter(([_, change]) => change.status === 'degraded')
    .map(([category, _]) => category)

  // 生成建議
  const recommendations = generateComparisonRecommendations(
    overallScoreChange,
    categoryChanges,
    newIssues,
    resolvedIssues
  )

  return {
    baseline,
    current,
    changes: {
      overallScoreChange,
      categoryChanges,
      newIssues,
      resolvedIssues
    },
    summary: {
      improvementAreas,
      regressionAreas,
      recommendations
    }
  }
}

function generateComparisonRecommendations(
  overallScoreChange: number,
  categoryChanges: Record<string, any>,
  newIssues: Array<any>,
  resolvedIssues: Array<any>
): string[] {
  const recommendations: string[] = []

  // 基於總體分數變化
  if (overallScoreChange > 10) {
    recommendations.push('項目健康狀況顯著改善，繼續保持良好的開發實踐')
  } else if (overallScoreChange < -10) {
    recommendations.push('項目健康狀況有所下降，需要關注退化的領域')
  }

  // 基於新問題
  if (newIssues.length > 0) {
    const criticalNewIssues = newIssues.filter(i => i.severity === 'critical')
    if (criticalNewIssues.length > 0) {
      recommendations.push(`發現 ${criticalNewIssues.length} 個新的嚴重問題，需要立即處理`)
    }
  }

  // 基於已解決問題
  if (resolvedIssues.length > 0) {
    recommendations.push(`成功解決了 ${resolvedIssues.length} 個問題，繼續保持`)
  }

  // 基於類別變化
  const degradedCategories = Object.entries(categoryChanges)
    .filter(([_, change]) => change.status === 'degraded')
    .map(([category, _]) => category)

  if (degradedCategories.length > 0) {
    recommendations.push(`重點關注以下退化領域：${degradedCategories.join(', ')}`)
  }

  return recommendations.slice(0, 5) // 限制建議數量
}

