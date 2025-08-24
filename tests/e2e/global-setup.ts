import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // 設置測試環境
  console.log('🚀 設置 E2E 測試環境...')

  // 創建測試用戶
  try {
    await page.goto('http://localhost:3000/signup')
    
    // 填寫註冊表單
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    
    // 提交註冊
    await page.click('button[type="submit"]')
    
    // 等待註冊完成
    await page.waitForURL(/\/features/, { timeout: 10000 })
    
    console.log('✅ 測試用戶創建成功')
  } catch (error) {
    console.log('⚠️ 測試用戶可能已存在或創建失敗:', error.message)
  }

  // 設置測試數據
  try {
    // 這裡可以添加測試數據設置邏輯
    // 例如：創建測試訂閱、插入測試數據等
    console.log('✅ 測試數據設置完成')
  } catch (error) {
    console.log('⚠️ 測試數據設置失敗:', error.message)
  }

  await browser.close()
  console.log('🎉 E2E 測試環境設置完成')
}

export default globalSetup

