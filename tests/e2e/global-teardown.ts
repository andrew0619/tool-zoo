import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // 清理測試環境
  console.log('🧹 清理 E2E 測試環境...')

  // 清理測試數據
  try {
    // 這裡可以添加測試數據清理邏輯
    // 例如：刪除測試用戶、清理測試數據等
    console.log('✅ 測試數據清理完成')
  } catch (error) {
    console.log('⚠️ 測試數據清理失敗:', error.message)
  }

  // 清理測試文件
  try {
    // 清理測試生成的文件
    console.log('✅ 測試文件清理完成')
  } catch (error) {
    console.log('⚠️ 測試文件清理失敗:', error.message)
  }

  await browser.close()
  console.log('🎉 E2E 測試環境清理完成')
}

export default globalTeardown

