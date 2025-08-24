import { test, expect } from '@playwright/test'

test.describe('認證功能測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('用戶註冊流程', async ({ page }) => {
    // 點擊註冊按鈕
    await page.click('text=Get Started')
    
    // 填寫註冊表單
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    
    // 提交表單
    await page.click('button[type="submit"]')
    
    // 驗證成功註冊
    await expect(page).toHaveURL(/\/features/)
    await expect(page.locator('text=歡迎')).toBeVisible()
  })

  test('用戶登入流程', async ({ page }) => {
    // 點擊登入按鈕
    await page.click('text=Login')
    
    // 填寫登入表單
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    
    // 提交表單
    await page.click('button[type="submit"]')
    
    // 驗證成功登入
    await expect(page).toHaveURL(/\/features/)
    await expect(page.locator('text=Tool Zoo 功能')).toBeVisible()
  })

  test('登出功能', async ({ page }) => {
    // 先登入
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // 點擊登出
    await page.click('[data-testid="logout-button"]')
    
    // 驗證已登出
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Login')).toBeVisible()
  })

  test('表單驗證', async ({ page }) => {
    // 測試註冊表單驗證
    await page.click('text=Get Started')
    
    // 提交空表單
    await page.click('button[type="submit"]')
    
    // 驗證錯誤信息
    await expect(page.locator('text=請輸入有效的電子郵件地址')).toBeVisible()
    await expect(page.locator('text=密碼至少需要8個字符')).toBeVisible()
  })
})

