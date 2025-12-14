export default function handler(req, res) {
  return res.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
}
