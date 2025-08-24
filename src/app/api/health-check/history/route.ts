import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { handleSupabaseError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: '項目 ID 是必需的',
        code: 'MISSING_PROJECT_ID'
      }, { status: 400 })
    }

    // 查詢健康檢查歷史記錄
    const { data: reports, error } = await supabase
      .from('health_reports')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // 查詢總數
    const { count, error: countError } = await supabase
      .from('health_reports')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    if (countError) {
      throw countError
    }

    return NextResponse.json({
      success: true,
      data: {
        reports: reports || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }
    })

  } catch (error: unknown) {
    console.error('健康檢查歷史 API 錯誤:', error)
    const appError = handleSupabaseError(error as Error)
    
    return NextResponse.json({
      success: false,
      error: appError.message,
      code: appError.code
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json({
        success: false,
        error: '報告 ID 是必需的',
        code: 'MISSING_REPORT_ID'
      }, { status: 400 })
    }

    // 刪除健康檢查報告
    const { error } = await supabase
      .from('health_reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: '健康檢查報告已刪除'
    })

  } catch (error: unknown) {
    console.error('刪除健康檢查報告錯誤:', error)
    const appError = handleSupabaseError(error as Error)
    
    return NextResponse.json({
      success: false,
      error: appError.message,
      code: appError.code
    }, { status: 500 })
  }
}

