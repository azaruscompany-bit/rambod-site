const webhook = require('./webhook');

const BOT_TOKEN = '8205418262:AAFJzhD72IPWmJ9jX1StRQWAcjpgOVXlbgQ';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const update = req.body;

    if (update.callback_query) {
      const data = update.callback_query.data;
      const [action, orderId, price] = data.split('_');

      if (action === 'approve') {
        webhook.orders[orderId].status = 'approved';
        webhook.orders[orderId].finalPrice = price;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: `✅ سفارش تایید شد با قیمت ${parseInt(price).toLocaleString()} تومان`,
            show_alert: true
          })
        });

      } else if (action === 'reject') {
        webhook.orders[orderId].status = 'rejected';
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: '❌ سفارش رد شد',
            show_alert: true
          })
        });
      }

      // حذف دکمه‌ها
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: update.callback_query.message.chat.id,
          message_id: update.callback_query.message.message_id,
          reply_markup: { inline_keyboard: [] }
        })
      });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({ ok: true });
  }
};