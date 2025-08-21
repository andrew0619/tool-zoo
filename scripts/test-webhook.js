const crypto = require('crypto');

// 模擬Stripe webhook事件
const testWebhook = async () => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
  
  // 模擬訂閱創建事件
  const event = {
    id: 'evt_test_webhook',
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        items: {
          data: [{
            price: {
              id: 'price_test_123',
              product: 'prod_test_123'
            }
          }]
        }
      }
    }
  };

  const payload = JSON.stringify(event);
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload, 'utf8')
    .digest('hex');

  console.log('測試Webhook事件:');
  console.log('Event Type:', event.type);
  console.log('Subscription ID:', event.data.object.id);
  console.log('Customer ID:', event.data.object.customer);
  console.log('Status:', event.data.object.status);
  
  // 發送到本地API
  try {
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': `t=${Date.now()},v1=${signature}`
      },
      body: payload
    });
    
    const result = await response.text();
    console.log('Webhook響應:', result);
  } catch (error) {
    console.error('Webhook測試失敗:', error.message);
  }
};

testWebhook();


