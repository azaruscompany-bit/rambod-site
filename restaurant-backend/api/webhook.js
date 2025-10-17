// حافظه موقت سفارش‌ها
const orders = {};

module.exports = async (req, res) => {
  // اجازه CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    const orderId = Date.now().toString();
    
    // ذخیره سفارش
    orders[orderId] = {
      ...orderData,
      status: 'pending',
      orderId: orderId,
      createdAt: new Date().toISOString()
    };

    // اگه سفارش شخصی هست، دکمه‌های تایید بفرست
    if (orderData.type === 'custom') {
      const BOT_TOKEN = '8205418262:AAFJzhD72IPWmJ9jX1StRQWAcjpgOVXlbgQ';
      const CHAT_ID = '5875288509';

      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ تایید - 200,000 تومان', callback_data: `approve_${orderId}_200000` }
          ],
          [
            { text: '✅ تایید - 250,000 تومان', callback_data: `approve_${orderId}_250000` }
          ],
          [
            { text: '✅ تایید - 300,000 تومان', callback_data: `approve_${orderId}_300000` }
          ],
          [
            { text: '✅ تایید - 350,000 تومان', callback_data: `approve_${orderId}_350000` }
          ],
          [
            { text: '❌ رد کردن', callback_data: `reject_${orderId}` }
          ]
        ]
      };

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `🆔 Order ID: ${orderId}\n\n${orderData.telegramMessage}`,
          parse_mode: 'HTML',
          reply_markup: keyboard
        })
      });
    } else {
      // سفارش آماده - فقط اطلاع‌رسانی
      const BOT_TOKEN = '8205418262:AAFJzhD72IPWmJ9jX1StRQWAcjpgOVXlbgQ';
      const CHAT_ID = '5875288509';

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: orderData.telegramMessage,
          parse_mode: 'HTML'
        })
      });
    }

    res.status(200).json({ 
      success: true, 
      orderId: orderId,
      message: 'سفارش ثبت شد'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export برای استفاده در فایل‌های دیگه
module.exports.orders = orders;