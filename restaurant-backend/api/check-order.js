const webhook = require('./webhook');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  const order = webhook.orders[orderId];

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.status(200).json({
    orderId: order.orderId,
    status: order.status,
    finalPrice: order.finalPrice || null
  });
};