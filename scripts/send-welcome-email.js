#!/usr/bin/env node

/**
 * 發送第一封歡迎郵件測試腳本
 * 用於測試郵件營銷系統
 */

const testSubscribers = [
  {
    email: 'test1@example.com',
    firstName: '張三',
    lastName: 'Zhang',
    source: 'blog'
  },
  {
    email: 'test2@example.com',
    firstName: '李四',
    lastName: 'Li',
    source: 'website'
  },
  {
    email: 'test3@example.com',
    firstName: '王五',
    lastName: 'Wang',
    source: 'social'
  }
]

async function sendWelcomeEmails() {
  console.log('🚀 開始發送歡迎郵件...')
  
  for (const subscriber of testSubscribers) {
    try {
      console.log(`📧 發送歡迎郵件給 ${subscriber.firstName} (${subscriber.email})...`)
      
      const response = await fetch('http://localhost:3000/api/email/send-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriber)
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ 成功發送給 ${subscriber.firstName}: ${result.message}`)
      } else {
        const error = await response.text()
        console.log(`❌ 發送失敗給 ${subscriber.firstName}: ${error}`)
      }
      
      // 等待 1 秒再發送下一封
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`❌ 發送失敗給 ${subscriber.firstName}: ${error.message}`)
    }
  }
  
  console.log('🎉 歡迎郵件發送完成！')
}

async function checkSubscriberStatus() {
  console.log('\n📊 檢查訂閱者狀態...')
  
  for (const subscriber of testSubscribers) {
    try {
      const response = await fetch(`http://localhost:3000/api/email/send-welcome?email=${subscriber.email}`)
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ ${subscriber.firstName}: ${result.subscriber.status}`)
      } else {
        console.log(`❌ ${subscriber.firstName}: 未找到`)
      }
      
    } catch (error) {
      console.log(`❌ 檢查失敗 ${subscriber.firstName}: ${error.message}`)
    }
  }
}

async function main() {
  console.log('🎯 Tool Zoo 歡迎郵件測試')
  console.log('========================')
  
  // 檢查服務器是否運行
  try {
    const healthCheck = await fetch('http://localhost:3000/api/health')
    if (!healthCheck.ok) {
      console.log('❌ 服務器未運行，請先啟動開發服務器：npm run dev')
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ 無法連接到服務器，請確保開發服務器正在運行')
    process.exit(1)
  }
  
  // 發送歡迎郵件
  await sendWelcomeEmails()
  
  // 檢查狀態
  await checkSubscriberStatus()
  
  console.log('\n📝 測試完成！')
  console.log('💡 提示：')
  console.log('   - 檢查控制台日誌查看郵件發送情況')
  console.log('   - 在生產環境中，這些郵件會真正發送給用戶')
  console.log('   - 可以查看 /api/email/send-welcome 端點的日誌')
}

// 運行測試
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { sendWelcomeEmails, checkSubscriberStatus }

