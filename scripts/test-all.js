#!/usr/bin/env node

// 綜合功能測試腳本
const { spawn } = require('child_process')
const path = require('path')

async function runTest(scriptName, description) {
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🧪 運行 ${description}...`)
    console.log(`${'='.repeat(60)}`)
    
    const child = spawn('node', [path.join(__dirname, scriptName)], {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    child.on('close', (code) => {
      console.log(`\n${description} 完成，退出碼: ${code}`)
      resolve(code === 0)
    })
    
    child.on('error', (error) => {
      console.error(`❌ ${description} 執行失敗:`, error.message)
      resolve(false)
    })
  })
}

async function testServerHealth() {
  console.log('\n🌐 測試開發服務器健康狀態...')
  
  try {
    const response = await fetch('http://localhost:3000')
    if (response.ok) {
      console.log('✅ 開發服務器正常運行')
      return true
    } else {
      console.log('❌ 開發服務器響應異常')
      return false
    }
  } catch (error) {
    console.log('❌ 無法連接到開發服務器')
    return false
  }
}

async function runAllTests() {
  console.log('🚀 開始綜合功能測試...\n')
  
  const results = {
    server: false,
    auth: false,
    stripe: false
  }
  
  // 測試服務器健康狀態
  results.server = await testServerHealth()
  
  // 運行認證測試
  results.auth = await runTest('test-auth.js', '認證功能測試')
  
  // 運行 Stripe 測試
  results.stripe = await runTest('test-stripe.js', 'Stripe 配置測試')
  
  // 輸出最終結果
  console.log('\n' + '='.repeat(60))
  console.log('📊 綜合測試結果總結')
  console.log('='.repeat(60))
  console.log(`開發服務器: ${results.server ? '✅ 正常' : '❌ 異常'}`)
  console.log(`認證功能: ${results.auth ? '✅ 通過' : '❌ 失敗'}`)
  console.log(`Stripe 配置: ${results.stripe ? '✅ 通過' : '❌ 失敗'}`)
  
  const allPassed = Object.values(results).every(result => result)
  console.log('\n' + '='.repeat(60))
  console.log(`總體結果: ${allPassed ? '🎉 所有測試通過!' : '⚠️ 部分測試失敗'}`)
  
  if (allPassed) {
    console.log('\n🎯 下一步建議:')
    console.log('1. 在瀏覽器中測試用戶註冊和登錄功能')
    console.log('2. 測試支付流程')
    console.log('3. 開始開發核心功能')
  } else {
    console.log('\n🔧 需要修復的問題:')
    if (!results.server) console.log('- 檢查開發服務器是否正在運行')
    if (!results.auth) console.log('- 檢查 Supabase 配置和數據庫連接')
    if (!results.stripe) console.log('- 檢查 Stripe 配置和產品設置')
  }
  
  return allPassed
}

// 運行所有測試
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('測試執行失敗:', error)
      process.exit(1)
    })
}

module.exports = { runAllTests }

