# 認證系統文檔

## 概述

Tool Zoo 使用 Supabase 作為認證後端，提供完整的用戶註冊、登入、登出和密碼重設功能。

## 架構

### 前端組件

#### 1. AuthProvider (`src/components/auth/AuthProvider.tsx`)
- 提供認證上下文
- 管理用戶狀態
- 監聽認證狀態變化

#### 2. 認證表單
- `SignInForm.tsx` - 登入表單
- `SignUpForm.tsx` - 註冊表單

#### 3. 受保護路由
- `ProtectedRoute.tsx` - 路由保護組件

#### 4. 動態導航
- `Navigation.tsx` - 根據登入狀態顯示不同選項

### 後端 API

#### 認證 API 路由
- `POST /api/auth/signup` - 用戶註冊
- `POST /api/auth/signin` - 用戶登入
- `POST /api/auth/signout` - 用戶登出
- `GET /api/auth/user` - 獲取當前用戶信息

### 核心功能

#### 1. 用戶註冊
```typescript
// 註冊新用戶
const { user, session } = await signUp(email, password)
```

#### 2. 用戶登入
```typescript
// 登入用戶
const { user, session } = await signIn(email, password)
```

#### 3. 用戶登出
```typescript
// 登出用戶
await signOut()
```

#### 4. 獲取用戶信息
```typescript
// 獲取當前用戶
const user = await getCurrentUser()

// 獲取用戶檔案
const profile = await getUserProfile(userId)
```

#### 5. 密碼重設
```typescript
// 發送重設密碼郵件
await resetPassword(email)
```

## 使用方式

### 在組件中使用認證

```typescript
import { useAuth } from '@/components/auth/AuthProvider'

function MyComponent() {
  const { user, profile, loading, signOut } = useAuth()
  
  if (loading) {
    return <div>載入中...</div>
  }
  
  if (!user) {
    return <div>請先登入</div>
  }
  
  return (
    <div>
      <p>歡迎，{user.email}</p>
      <button onClick={signOut}>登出</button>
    </div>
  )
}
```

### 保護路由

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>這是受保護的內容</div>
    </ProtectedRoute>
  )
}
```

## 數據驗證

### 註冊表單驗證
```typescript
export const SignUpSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string()
    .min(8, '密碼至少需要8個字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密碼必須包含大小寫字母和數字'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "密碼不匹配",
  path: ["confirmPassword"]
})
```

### 登入表單驗證
```typescript
export const SignInSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(1, '密碼不能為空')
})
```

## 錯誤處理

### Supabase 錯誤處理
```typescript
import { handleSupabaseError } from '@/lib/error-handler'

try {
  await signIn(email, password)
} catch (error) {
  const appError = handleSupabaseError(error)
  // 處理錯誤
}
```

### 常見錯誤代碼
- `INVALID_EMAIL` - 無效的電子郵件地址
- `WEAK_PASSWORD` - 密碼強度不足
- `USER_NOT_FOUND` - 用戶不存在
- `INVALID_PASSWORD` - 密碼錯誤
- `EMAIL_NOT_CONFIRMED` - 電子郵件未驗證

## 安全特性

### 1. 密碼強度要求
- 最少 8 個字符
- 必須包含大小寫字母和數字

### 2. 電子郵件驗證
- 註冊後需要驗證電子郵件
- 支持重設密碼功能

### 3. 會話管理
- 自動會話續期
- 安全的登出機制

### 4. 路由保護
- 未登入用戶自動重定向到登入頁面
- 支持自定義重定向路徑

## 頁面路由

### 公開頁面
- `/` - 主頁
- `/login` - 登入頁面
- `/signup` - 註冊頁面
- `/forgot-password` - 忘記密碼頁面
- `/blog` - 博客頁面

### 受保護頁面
- `/dashboard` - 用戶儀表板
- `/features` - 功能頁面
- `/profile` - 個人資料頁面

## 測試

### API 測試
```bash
# 測試用戶 API
curl -X GET http://localhost:3000/api/auth/user

# 測試註冊 API
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","confirmPassword":"Password123"}'
```

### E2E 測試
```bash
# 運行認證相關的 E2E 測試
npm run test:e2e -- tests/e2e/auth.spec.ts
```

## 部署注意事項

### 環境變量
確保設置以下環境變量：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Supabase 配置
1. 啟用電子郵件認證
2. 配置電子郵件模板
3. 設置重定向 URL
4. 配置 RLS 策略

## 未來改進

### 計劃中的功能
1. **社交登入** - Google, GitHub, Twitter
2. **雙因素認證** - TOTP 支持
3. **角色權限管理** - 更細粒度的權限控制
4. **會話管理** - 多設備登入管理
5. **審計日誌** - 登入活動記錄

### 性能優化
1. **緩存用戶信息** - 減少 API 調用
2. **預加載用戶數據** - 改善用戶體驗
3. **離線支持** - 離線狀態下的認證處理

