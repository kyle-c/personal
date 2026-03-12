import type { WebhookPayload } from '../types';
import { routeMessage } from '../flows/index';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'felixclaw-verify';

/**
 * GET /webhook — Webhook verification endpoint
 * Meta sends a GET request to verify the webhook URL
 */
export function handleVerification(query: {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
}): { status: number; body: string } {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return { status: 200, body: challenge || '' };
  }

  console.warn('Webhook verification failed');
  return { status: 403, body: 'Forbidden' };
}

/**
 * POST /webhook — Incoming message handler
 */
export async function handleIncoming(payload: WebhookPayload): Promise<void> {
  if (payload.object !== 'whatsapp_business_account') return;

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue;

      const messages = change.value.messages;
      if (!messages) continue;

      for (const message of messages) {
        try {
          await routeMessage(message);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    }
  }
}
