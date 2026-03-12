import type {
  TextMessage,
  InteractiveButtonMessage,
  InteractiveListMessage,
} from '../types';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

async function sendMessage(message: TextMessage | InteractiveButtonMessage | InteractiveListMessage): Promise<void> {
  const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('WhatsApp API error:', error);
    throw new Error(`WhatsApp API error: ${response.status}`);
  }
}

export async function sendTextMessage(to: string, body: string): Promise<void> {
  const message: TextMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body },
  };
  await sendMessage(message);
}

export async function sendInteractiveButtons(
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>
): Promise<void> {
  // WhatsApp allows max 3 buttons
  const truncatedButtons = buttons.slice(0, 3);

  const message: InteractiveButtonMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: truncatedButtons.map((btn) => ({
          type: 'reply' as const,
          reply: { id: btn.id, title: btn.title.slice(0, 20) }, // WhatsApp 20 char limit
        })),
      },
    },
  };
  await sendMessage(message);
}

export async function sendListMessage(
  to: string,
  body: string,
  buttonText: string,
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>
): Promise<void> {
  const message: InteractiveListMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: body },
      action: {
        button: buttonText.slice(0, 20),
        sections: sections.map((section) => ({
          title: section.title.slice(0, 24),
          rows: section.rows.map((row) => ({
            id: row.id,
            title: row.title.slice(0, 24),
            description: row.description?.slice(0, 72),
          })),
        })),
      },
    },
  };
  await sendMessage(message);
}
