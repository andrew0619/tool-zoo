#!/usr/bin/env node

// Stripe 配置測試腳本
const fs = require('fs')
const path = require('path')

// 讀取環境變數
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (!key.startsWith('#')) {
          envVars[key.trim()] = value
        }
      }
    })
    
    return envVars
  }
  return {}
}

const envVars = loadEnvFile()

async function testStripeConfiguration() {
  console.log('💳 測試 Stripe 配置...')
  
  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ]
  
  const results = {}
  
  for (const varName of requiredVars) {
    const value = envVars[varName]
    const isSet = value && value !== 'your_stripe_' + varName.toLowerCase().replace('stripe_', '').replace('next_public_', '')
    
    results[varName] = isSet
    console.log(`${varName}: ${isSet ? '✅ 已設置' : '❌ 未設置'}`)
  }
  
  return results
}

async function testStripeAPI() {
  console.log('\n🔌 測試 Stripe API 連接...')
  
  const stripeSecretKey = envVars.STRIPE_SECRET_KEY
  
  if (!stripeSecretKey || stripeSecretKey.includes('your_')) {
    console.log('⚠️ 跳過 API 測試 (缺少有效的 Stripe Secret Key)')
    return false
  }
  
  try {
    // 動態導入 Stripe
    const Stripe = require('stripe')
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })
    
    // 測試 API 連接
    const account = await stripe.accounts.retrieve()
    console.log('✅ Stripe API 連接成功!')
    console.log('帳戶 ID:', account.id)
    console.log('帳戶類型:', account.type)
    
    return true
  } catch (error) {
    console.error('❌ Stripe API 連接失敗:', error.message)
    return false
  }
}

async function testStripeProducts() {
  console.log('\n📦 檢查 Stripe 產品配置...')
  
  const stripeSecretKey = envVars.STRIPE_SECRET_KEY
  
  if (!stripeSecretKey || stripeSecretKey.includes('your_')) {
    console.log('⚠️ 跳過產品檢查 (缺少有效的 Stripe Secret Key)')
    return false
  }
  
  try {
    const Stripe = require('stripe')
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })
    
    // 獲取產品列表
    const products = await stripe.products.list({ limit: 10 })
    console.log(`✅ 找到 ${products.data.length} 個產品`)
    
    if (products.data.length > 0) {
      console.log('產品列表:')
      products.data.forEach(product => {
        console.log(`  - ${product.name} (ID: ${product.id})`)
      })
    } else {
      console.log('⚠️ 沒有找到產品，需要創建產品和價格')
    }
    
    return true
  } catch (error) {
    console.error('❌ 產品檢查失敗:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 開始 Stripe 配置測試...\n')
  
  const results = {
    config: false,
    api: false,
    products: false
  }
  
  // 運行測試
  const configResults = await testStripeConfiguration()
  results.config = Object.values(configResults).every(result => result)
  
  results.api = await testStripeAPI()
  results.products = await testStripeProducts()
  
  // 輸出結果
  console.log('\n📊 測試結果總結:')
  console.log('='.repeat(50))
  console.log(`配置檢查: ${results.config ? '✅ 通過' : '❌ 失敗'}`)
  console.log(`API 連接: ${results.api ? '✅ 通過' : '❌ 失敗'}`)
  console.log(`產品檢查: ${results.products ? '✅ 通過' : '❌ 失敗'}`)
  
  const allPassed = Object.values(results).every(result => result)
  console.log('\n' + '='.repeat(50))
  console.log(`總體結果: ${allPassed ? '🎉 所有測試通過!' : '⚠️ 部分測試失敗'}`)
  
  if (!results.config) {
    console.log('\n💡 建議:')
    console.log('1. 在 Stripe Dashboard 中創建產品和價格')
    console.log('2. 更新 .env.local 文件中的 Stripe 配置')
    console.log('3. 設置 webhook endpoint')
  }
  
  return allPassed
}

// 運行測試
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('測試執行失敗:', error)
      process.exit(1)
    })
}

module.exports = { runTests }

