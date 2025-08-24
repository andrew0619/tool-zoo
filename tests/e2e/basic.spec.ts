import { test, expect } from '@playwright/test'

test.describe('基礎功能測試', () => {
  test('主頁加載測試', async ({ page }) => {
    await page.goto('/')
    
    // 驗證主頁元素
    await expect(page.locator('h1')).toContainText('Tool Zoo')
    await expect(page.locator('text=AI創業者的一盒化解決方案')).toBeVisible()
    
    // 驗證導航鏈接
    await expect(page.locator('a[href="/features"]')).toBeVisible()
    await expect(page.locator('a[href="/blog"]')).toBeVisible()
  })

  test('功能頁面測試', async ({ page }) => {
    await page.goto('/features')
    
    // 驗證功能頁面元素
    await expect(page.locator('h1')).toContainText('Tool Zoo 功能')
    
    // 驗證三個核心功能
    await expect(page.locator('text=Entitlements Sandbox')).toBeVisible()
    await expect(page.locator('text=JSON-AI Salvage Kit')).toBeVisible()
    await expect(page.locator('text=Pipeline Dashboard')).toBeVisible()
  })

  test('博客頁面測試', async ({ page }) => {
    await page.goto('/blog')
    
    // 驗證博客頁面元素
    await expect(page.locator('h1')).toContainText('Tool Zoo 技術博客')
    
    // 驗證文章列表
    await expect(page.locator('text=開始使用 Tool Zoo')).toBeVisible()
    
    // 驗證郵件訂閱組件
    await expect(page.locator('text=訂閱我們的技術更新')).toBeVisible()
  })

  test('健康檢查 API 測試', async ({ page }) => {
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data.services).toBeDefined()
  })

  test('Analytics API 測試', async ({ page }) => {
    const response = await page.request.get('/api/analytics?type=conversions&range=7d')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.totalConversions).toBeDefined()
    expect(data.conversionRate).toBeDefined()
    expect(data.revenue).toBeDefined()
    expect(data.topConvertingPages).toBeDefined()
  })

  test('響應式設計測試', async ({ page }) => {
    // 測試桌面版
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
    
    // 測試平板版
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await expect(page.locator('nav')).toBeVisible()
    
    // 測試手機版
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await expect(page.locator('nav')).toBeVisible()
  })

  test('頁面性能測試', async ({ page }) => {
    // 測試主頁加載時間
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    
    // 驗證加載時間在合理範圍內
    expect(loadTime).toBeLessThan(5000) // 5秒內
    
    // 測試功能頁面加載時間
    const startTime2 = Date.now()
    await page.goto('/features')
    const loadTime2 = Date.now() - startTime2
    
    expect(loadTime2).toBeLessThan(5000) // 5秒內
  })

  test('錯誤處理測試', async ({ page }) => {
    // 測試 404 頁面
    await page.goto('/non-existent-page')
    await expect(page.locator('text=404')).toBeVisible()
    
    // 測試無效的 API 端點
    const response = await page.request.get('/api/non-existent')
    expect(response.status()).toBe(404)
  })

  test('SEO 和元數據測試', async ({ page }) => {
    await page.goto('/')
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/Tool Zoo/)
    
    // 驗證 meta 描述
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    expect(metaDescription).toContain('AI創業者')
    
    // 驗證 Open Graph 標籤
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toContain('Tool Zoo')
  })
})

