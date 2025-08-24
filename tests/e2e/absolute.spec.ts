import { test, expect } from '@playwright/test'

test.describe('絕對 URL 測試', () => {
  test('主頁可以訪問', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/Tool Zoo/)
    
    // 驗證頁面內容 - 使用更具體的選擇器
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('text=AI創業者').first()).toBeVisible()
  })

  test('健康檢查 API 工作正常', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/health')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('healthy')
  })

  test('功能頁面需要登入', async ({ page }) => {
    await page.goto('http://localhost:3000/features')
    
    // 驗證登入提示
    await expect(page.locator('text=請先登入')).toBeVisible()
    await expect(page.locator('text=您需要登入才能訪問功能')).toBeVisible()
  })

  test('博客頁面可以訪問', async ({ page }) => {
    await page.goto('http://localhost:3000/blog')
    
    // 驗證頁面內容 - 使用更具體的選擇器
    await expect(page.locator('text=Tool Zoo 技術博客')).toBeVisible()
    await expect(page.locator('text=開始使用 Tool Zoo')).toBeVisible()
  })
})
