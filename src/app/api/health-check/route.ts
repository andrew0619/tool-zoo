import { NextRequest, NextResponse } from 'next/server'
import { TechHealthCheck } from '@/lib/tech-health-check'
import { HealthReportSchema } from '@/lib/types'
import { handleSupabaseError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || 'default-project'
    const projectPath = searchParams.get('projectPath') || process.cwd()
    
    // 創建健康檢查實例
    const healthChecker = new TechHealthCheck(projectPath, {
      includeTests: true,
      includeDependencies: true,
      includePerformance: true,
      includeSecurity: true
    })

    // 執行項目分析
    const report = await healthChecker.analyzeProject(projectId)

    // 驗證報告格式
    const validatedReport = HealthReportSchema.parse(report)

    return NextResponse.json({
      success: true,
      data: validatedReport,
      message: '健康檢查完成'
    })

  } catch (error: unknown) {
    console.error('健康檢查 API 錯誤:', error)
    const appError = handleSupabaseError(error as Error)
    
    return NextResponse.json({
      success: false,
      error: appError.message,
      code: appError.code
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, options = {} } = body

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: '項目 ID 是必需的',
        code: 'MISSING_PROJECT_ID'
      }, { status: 400 })
    }

    // 創建健康檢查實例
    const healthChecker = new TechHealthCheck(process.cwd(), options)

    // 執行項目分析
    const report = await healthChecker.analyzeProject(projectId)

    // 驗證報告格式
    const validatedReport = HealthReportSchema.parse(report)

    // 這裡可以將報告保存到數據庫
    // await saveHealthReport(validatedReport)

    return NextResponse.json({
      success: true,
      data: validatedReport,
      message: '健康檢查完成並已保存'
    })

  } catch (error: unknown) {
    console.error('健康檢查 API 錯誤:', error)
    const appError = handleSupabaseError(error as Error)
    
    return NextResponse.json({
      success: false,
      error: appError.message,
      code: appError.code
    }, { status: 500 })
  }
}

