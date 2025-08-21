# Stripe Webhook 設置指南

## 開發階段設置

### 1. 使用Stripe CLI（推薦）

```bash
# 安裝Stripe CLI
brew install stripe/stripe-cli/stripe

# 登入Stripe
stripe login

# 啟動webhook監聽器
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. 手動設置Webhook

在Stripe Dashboard中：

1. 前往 **Developers > Webhooks**
2. 點擊 **"+ Add endpoint"**
3. 設置：
   - **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
   - **Events to send**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 3. 獲取Webhook Secret

設置完成後，複製 **Signing secret** 並添加到 `.env.local`：

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 生產環境設置

### 1. 部署到Vercel

```bash
# 部署到Vercel
vercel --prod

# 獲取生產URL
# 例如: https://tool-zoo.vercel.app
```

### 2. 更新Webhook URL

在Stripe Dashboard中更新Webhook端點：

```
https://tool-zoo.vercel.app/api/stripe/webhook
```

### 3. 設置環境變數

在Vercel Dashboard中設置：

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## 測試Webhook

### 1. 使用測試腳本

```bash
node scripts/test-webhook.js
```

### 2. 在Stripe Dashboard中測試

1. 前往 **Developers > Webhooks**
2. 選擇你的webhook端點
3. 點擊 **"Send test webhook"**
4. 選擇事件類型並發送

## 常見問題

### Q: Webhook驗證失敗？
A: 檢查 `STRIPE_WEBHOOK_SECRET` 是否正確設置

### Q: 本地測試無法接收webhook？
A: 使用Stripe CLI或ngrok創建公開URL

### Q: 生產環境webhook失敗？
A: 檢查Vercel環境變數和URL設置


