/**
 * FelixClaw WhatsApp Bot Server
 *
 * Setup:
 * 1. Create a Meta Business account and WhatsApp Business App
 * 2. Get your Phone Number ID and Access Token from the Meta dashboard
 * 3. Set environment variables:
 *    - WHATSAPP_PHONE_NUMBER_ID
 *    - WHATSAPP_ACCESS_TOKEN
 *    - WHATSAPP_VERIFY_TOKEN (any string you choose)
 *    - PORT (optional, defaults to 3000)
 * 4. Run: npx ts-node bot/server.ts
 * 5. Use ngrok or similar to expose your local server
 * 6. Configure the webhook URL in Meta dashboard
 */

// Note: This scaffold uses the native Node.js http module to avoid
// adding express as a dependency. In production, use express or fastify.

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { handleVerification, handleIncoming } from './routes/webhook';

const PORT = parseInt(process.env.PORT || '3000', 10);

function parseQuery(url: string): Record<string, string> {
  const queryString = url.split('?')[1] || '';
  const params: Record<string, string> = {};
  for (const pair of queryString.split('&')) {
    const [key, value] = pair.split('=');
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return params;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url || '/';
  const method = req.method || 'GET';

  // Health check
  if (url === '/' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'FelixClaw WhatsApp Bot' }));
    return;
  }

  // Webhook endpoints
  if (url.startsWith('/webhook')) {
    if (method === 'GET') {
      const query = parseQuery(url);
      const result = handleVerification(query);
      res.writeHead(result.status, { 'Content-Type': 'text/plain' });
      res.end(result.body);
      return;
    }

    if (method === 'POST') {
      try {
        const body = await readBody(req);
        const payload = JSON.parse(body);
        await handleIncoming(payload);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
      } catch (error) {
        console.error('Webhook error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 FelixClaw Bot Server running on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`\nSetup instructions:`);
  console.log(`1. Set WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_VERIFY_TOKEN`);
  console.log(`2. Use ngrok: ngrok http ${PORT}`);
  console.log(`3. Configure webhook in Meta dashboard with your ngrok URL + /webhook`);
});
