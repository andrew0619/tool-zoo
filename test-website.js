#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:3000';

// 顏色輸出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Tool-Zoo-Test-Script/1.0'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoint(path, expectedStatus = 200, description = '') {
  try {
    const url = `${BASE_URL}${path}`;
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      log(`✅ ${description || path} - ${response.statusCode}`, 'green');
      return true;
    } else {
      log(`❌ ${description || path} - 期望 ${expectedStatus}, 實際 ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description || path} - 錯誤: ${error.message}`, 'red');
    return false;
  }
}

async function testAPIEndpoint(path, method = 'GET', data = null, expectedStatus = 200) {
  try {
    const url = `${BASE_URL}${path}`;
    const response = await makeRequest(url, method, data);
    
    if (response.statusCode === expectedStatus) {
      log(`✅ API ${method} ${path} - ${response.statusCode}`, 'green');
      
      // 嘗試解析 JSON 響應
      try {
        const jsonData = JSON.parse(response.body);
        if (jsonData.success !== undefined) {
          log(`   └─ Success: ${jsonData.success}`, jsonData.success ? 'green' : 'red');
        }
      } catch (e) {
        // 不是 JSON 響應，忽略
      }
      
      return true;
    } else {
      log(`❌ API ${method} ${path} - 期望 ${expectedStatus}, 實際 ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ API ${method} ${path} - 錯誤: ${error.message}`, 'red');
    return false;
  }
}

async function testHealthCheck() {
  log('\n🏥 測試健康檢查功能...', 'blue');
  
  const results = [];
  
  // 測試健康檢查 API
  results.push(await testAPIEndpoint('/api/health-check', 'GET', null, 200));
  
  // 測試健康檢查頁面
  results.push(await testEndpoint('/health-check', 200, '健康檢查頁面'));
  
  return results.every(r => r);
}

async function testAuthentication() {
  log('\n🔐 測試認證系統...', 'blue');
  
  const results = [];
  
  // 測試登入頁面
  results.push(await testEndpoint('/login', 200, '登入頁面'));
  
  // 測試註冊頁面
  results.push(await testEndpoint('/signup', 200, '註冊頁面'));
  
  // 測試忘記密碼頁面
  results.push(await testEndpoint('/forgot-password', 200, '忘記密碼頁面'));
  
  // 測試儀表板（應該重定向到登入）
  results.push(await testEndpoint('/dashboard', 200, '儀表板頁面'));
  
  // 測試認證 API
  results.push(await testAPIEndpoint('/api/auth/user', 'GET', null, 401));
  
  return results.every(r => r);
}

async function testFeatures() {
  log('\n⚡ 測試功能頁面...', 'blue');
  
  const results = [];
  
  // 測試功能頁面
  results.push(await testEndpoint('/features', 200, '功能頁面'));
  
  // 測試博客頁面
  results.push(await testEndpoint('/blog', 200, '博客頁面'));
  
  return results.every(r => r);
}

async function testAPIEndpoints() {
  log('\n🔌 測試 API 端點...', 'blue');
  
  const results = [];
  
  // 測試健康 API
  results.push(await testAPIEndpoint('/api/health', 'GET', null, 200));
  
  // 測試郵件發送 API
  results.push(await testAPIEndpoint('/api/email/send-welcome', 'POST', {
    email: 'test@example.com'
  }, 200));
  
  return results.every(r => r);
}

async function testResponsiveDesign() {
  log('\n📱 測試響應式設計...', 'blue');
  
  // 檢查是否有響應式 CSS 類
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    const hasResponsiveClasses = response.body.includes('sm:') || 
                                response.body.includes('md:') || 
                                response.body.includes('lg:') ||
                                response.body.includes('xl:');
    
    if (hasResponsiveClasses) {
      log('✅ 檢測到響應式 CSS 類', 'green');
      return true;
    } else {
      log('⚠️  未檢測到響應式 CSS 類', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ 響應式設計測試失敗: ${error.message}`, 'red');
    return false;
  }
}

async function testPerformance() {
  log('\n⚡ 測試性能...', 'blue');
  
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    const loadTime = Date.now() - startTime;
    
    if (loadTime < 2000) {
      log(`✅ 主頁加載時間: ${loadTime}ms (良好)`, 'green');
      return true;
    } else if (loadTime < 5000) {
      log(`⚠️  主頁加載時間: ${loadTime}ms (一般)`, 'yellow');
      return true;
    } else {
      log(`❌ 主頁加載時間: ${loadTime}ms (較慢)`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 性能測試失敗: ${error.message}`, 'red');
    return false;
  }
}

async function testErrorHandling() {
  log('\n⚠️  測試錯誤處理...', 'blue');
  
  const results = [];
  
  // 測試 404 頁面
  results.push(await testEndpoint('/non-existent-page', 404, '404 錯誤頁面'));
  
  // 測試無效的 API 端點
  results.push(await testAPIEndpoint('/api/invalid-endpoint', 'GET', null, 404));
  
  return results.every(r => r);
}

async function runAllTests() {
  log('🚀 開始 Tool Zoo 網站測試...', 'bold');
  log(`📍 測試目標: ${BASE_URL}`, 'blue');
  
  const testResults = [];
  
  // 基本功能測試
  testResults.push(await testEndpoint('/', 200, '主頁'));
  
  // 健康檢查測試
  testResults.push(await testHealthCheck());
  
  // 認證系統測試
  testResults.push(await testAuthentication());
  
  // 功能頁面測試
  testResults.push(await testFeatures());
  
  // API 端點測試
  testResults.push(await testAPIEndpoints());
  
  // 響應式設計測試
  testResults.push(await testResponsiveDesign());
  
  // 性能測試
  testResults.push(await testPerformance());
  
  // 錯誤處理測試
  testResults.push(await testErrorHandling());
  
  // 總結
  log('\n📊 測試結果總結:', 'bold');
  const passedTests = testResults.filter(r => r).length;
  const totalTests = testResults.length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  if (successRate >= 90) {
    log(`✅ 測試通過率: ${successRate}% (${passedTests}/${totalTests})`, 'green');
  } else if (successRate >= 70) {
    log(`⚠️  測試通過率: ${successRate}% (${passedTests}/${totalTests})`, 'yellow');
  } else {
    log(`❌ 測試通過率: ${successRate}% (${passedTests}/${totalTests})`, 'red');
  }
  
  return successRate >= 70;
}

// 運行測試
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log(`❌ 測試執行失敗: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = {
  testEndpoint,
  testAPIEndpoint,
  testHealthCheck,
  testAuthentication,
  testFeatures,
  testAPIEndpoints,
  testResponsiveDesign,
  testPerformance,
  testErrorHandling,
  runAllTests
};

