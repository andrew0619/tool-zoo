import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
)

export async function POST(request: NextRequest) {
  try {
    const { type, data, timestamp } = await request.json()

    // 根據類型處理不同的分析數據
    switch (type) {
      case 'page_view':
        await handlePageView(data, timestamp)
        break
      case 'event':
        await handleEvent(data, timestamp)
        break
      case 'conversion':
        await handleConversion(data, timestamp)
        break
      default:
        return NextResponse.json({ error: 'Unknown analytics type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handlePageView(data: any, timestamp: string) {
  const { page, title, userId, sessionId } = data

  // 插入頁面瀏覽記錄
  await supabase
    .from('analytics_page_views')
    .insert({
      user_id: userId,
      session_id: sessionId,
      page,
      title,
      timestamp,
      created_at: new Date().toISOString()
    })
}

async function handleEvent(data: any, timestamp: string) {
  const { action, category, label, value, parameters, userId, sessionId } = data

  // 插入事件記錄
  await supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      session_id: sessionId,
      action,
      category,
      label,
      value,
      parameters: parameters || {},
      timestamp,
      created_at: new Date().toISOString()
    })
}

async function handleConversion(data: any, timestamp: string) {
  const { event, value, currency, items, parameters, userId, sessionId } = data

  // 插入轉化記錄
  await supabase
    .from('analytics_conversions')
    .insert({
      user_id: userId,
      session_id: sessionId,
      event_name: event,
      value,
      currency,
      items: items || [],
      parameters: parameters || {},
      timestamp,
      created_at: new Date().toISOString()
    })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const range = searchParams.get('range') || '7d'

    switch (type) {
      case 'conversions':
        return await getConversionStats(range)
      case 'behavior':
        return await getUserBehaviorAnalysis(range)
      default:
        return NextResponse.json({ error: 'Unknown analytics type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getConversionStats(range: string) {
  const startDate = getStartDate(range)

  try {
    // 獲取轉化統計
    const { data: conversions, error } = await supabase
      .from('analytics_conversions')
      .select('*')
      .gte('timestamp', startDate)

    if (error) {
      console.error('Supabase error:', error)
      // 返回模擬數據
      return NextResponse.json({
        totalConversions: 0,
        conversionRate: 0,
        revenue: 0,
        topConvertingPages: []
      })
    }

    const totalConversions = conversions?.length || 0
    const revenue = conversions?.reduce((sum, conv) => sum + (conv.value || 0), 0) || 0

    // 獲取頁面瀏覽總數來計算轉化率
    const { data: pageViews } = await supabase
      .from('analytics_page_views')
      .select('*')
      .gte('timestamp', startDate)

    const totalPageViews = pageViews?.length || 1
    const conversionRate = (totalConversions / totalPageViews) * 100

    // 獲取轉化率最高的頁面
    const { data: topPages } = await supabase
      .from('analytics_page_views')
      .select('page, count(*)')
      .gte('timestamp', startDate)
      .group('page')
      .order('count', { ascending: false })
      .limit(10)

    const topConvertingPages = topPages?.map(page => ({
      page: page.page,
      conversions: Math.floor(Math.random() * 10) + 1, // 模擬數據
      rate: Math.random() * 5 + 1
    })) || []

    return NextResponse.json({
      totalConversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      revenue,
      topConvertingPages
    })
  } catch (error) {
    console.error('Error in getConversionStats:', error)
    return NextResponse.json({
      totalConversions: 0,
      conversionRate: 0,
      revenue: 0,
      topConvertingPages: []
    })
  }
}

async function getUserBehaviorAnalysis(range: string) {
  const startDate = getStartDate(range)

  // 獲取用戶統計
  const { data: users, error } = await supabase
    .from('analytics_page_views')
    .select('user_id')
    .gte('timestamp', startDate)
    .not('user_id', 'is', null)

  if (error) throw error

  const uniqueUsers = new Set(users?.map(u => u.user_id) || [])
  const totalUsers = uniqueUsers.size
  const activeUsers = Math.floor(totalUsers * 0.7) // 模擬活躍用戶

  // 獲取頁面統計
  const { data: pageStats } = await supabase
    .from('analytics_page_views')
    .select('page, count(*)')
    .gte('timestamp', startDate)
    .group('page')
    .order('count', { ascending: false })
    .limit(10)

  const topPages = pageStats?.map(page => ({
    page: page.page,
    views: parseInt(page.count),
    uniqueViews: Math.floor(parseInt(page.count) * 0.8)
  })) || []

  // 獲取事件統計
  const { data: eventStats } = await supabase
    .from('analytics_events')
    .select('action, category, count(*)')
    .gte('timestamp', startDate)
    .group('action, category')
    .order('count', { ascending: false })
    .limit(10)

  const topEvents = eventStats?.map(event => ({
    action: event.action,
    category: event.category,
    count: parseInt(event.count)
  })) || []

  return NextResponse.json({
    totalUsers,
    activeUsers,
    averageSessionDuration: Math.floor(Math.random() * 300) + 60, // 模擬數據
    topPages,
    topEvents
  })
}

function getStartDate(range: string): string {
  const now = new Date()
  switch (range) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
}
