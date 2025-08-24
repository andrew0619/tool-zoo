import { test, expect } from '@playwright/test'

test.describe('功能模塊測試', () => {
  test.beforeEach(async ({ page }) => {
    // 登入
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // 等待登入完成
    await page.waitForURL(/\/features/)
  })

  test('JSON-AI Salvage Kit 功能測試', async ({ page }) => {
    // 導航到 JSON Salvage 功能
    await page.click('text=JSON-AI Salvage Kit')
    
    // 輸入無效的 JSON
    const invalidJson = '{name: "test", value: 123}'
    await page.fill('textarea[placeholder*="JSON"]', invalidJson)
    
    // 點擊修復按鈕
    await page.click('text=開始修復')
    
    // 等待修復完成
    await page.waitForSelector('textarea[readonly]')
    
    // 驗證修復結果
    const repairedJson = await page.inputValue('textarea[readonly]')
    expect(repairedJson).toContain('"name"')
    expect(repairedJson).toContain('"value"')
    
    // 驗證錯誤熱點顯示
    await expect(page.locator('text=檢測到的問題')).toBeVisible()
  })

  test('Pipeline Dashboard 功能測試', async ({ page }) => {
    // 導航到 Pipeline Dashboard
    await page.click('text=Pipeline Dashboard')
    
    // 驗證實時指標顯示
    await expect(page.locator('text=實時監控')).toBeVisible()
    await expect(page.locator('text=活躍請求')).toBeVisible()
    
    // 驗證成本分析
    await expect(page.locator('text=成本分析')).toBeVisible()
    
    // 驗證警報系統
    await expect(page.locator('text=活躍警報')).toBeVisible()
  })

  test('Entitlements Sandbox 功能測試', async ({ page }) => {
    // 導航到 Entitlements Sandbox
    await page.click('text=Entitlements Sandbox')
    
    // 驗證權限管理界面
    await expect(page.locator('text=多租戶權限管理')).toBeVisible()
    await expect(page.locator('text=權限列表')).toBeVisible()
    
    // 驗證租戶管理
    await expect(page.locator('text=租戶管理')).toBeVisible()
  })

  test('功能權限控制', async ({ page }) => {
    // 測試免費用戶權限
    await page.goto('/features/salvage')
    
    // 驗證基礎功能可用
    await expect(page.locator('text=基礎策略')).toBeVisible()
    
    // 驗證高級功能受限
    await expect(page.locator('text=AI 策略')).not.toBeVisible()
  })

  test('響應式設計測試', async ({ page }) => {
    // 測試桌面版
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/features')
    await expect(page.locator('.grid-cols-3')).toBeVisible()
    
    // 測試平板版
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await expect(page.locator('.grid-cols-2')).toBeVisible()
    
    // 測試手機版
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await expect(page.locator('.grid-cols-1')).toBeVisible()
  })

  test('性能測試', async ({ page }) => {
    // 測試頁面加載時間
    const startTime = Date.now()
    await page.goto('/features')
    const loadTime = Date.now() - startTime
    
    // 驗證加載時間在合理範圍內
    expect(loadTime).toBeLessThan(3000) // 3秒內
    
    // 測試 API 響應時間
    const apiStartTime = Date.now()
    await page.goto('/api/health')
    const apiResponseTime = Date.now() - apiStartTime
    
    // 驗證 API 響應時間
    expect(apiResponseTime).toBeLessThan(1000) // 1秒內
  })

  test('錯誤處理測試', async ({ page }) => {
    // 測試 404 頁面
    await page.goto('/non-existent-page')
    await expect(page.locator('text=404')).toBeVisible()
    
    // 測試網絡錯誤處理
    await page.route('**/api/**', route => route.abort())
    await page.goto('/features')
    
    // 驗證錯誤信息顯示
    await expect(page.locator('text=數據加載失敗')).toBeVisible()
  })
})

