import { test, expect } from '@playwright/test'

test.describe('簡單功能測試', () => {
  test('主頁可以訪問', async ({ page }) => {
    await page.goto('/')
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/Tool Zoo/)
    
    // 驗證頁面內容
    await expect(page.locator('h1')).toBeVisible()
  })

  test('健康檢查 API 工作正常', async ({ page }) => {
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('healthy')
  })

  test('功能頁面可以訪問', async ({ page }) => {
    await page.goto('/features')
    
    // 驗證頁面內容
    await expect(page.locator('h1')).toBeVisible()
  })

  test('博客頁面可以訪問', async ({ page }) => {
    await page.goto('/blog')
    
    // 驗證頁面內容
    await expect(page.locator('h1')).toBeVisible()
  })
})

