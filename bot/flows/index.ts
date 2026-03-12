import type { IncomingMessage, UserSession, Language } from '../types';
import { handleWelcome } from './welcome';
import { handleFinancialMenu, handleFinancialAction } from './financial';
import { handleLegalMenu, handleLegalAction } from './legal';
import { handleCommunityMenu, handleCommunityAction } from './community';
import { handleEmergency } from './emergency';

// In-memory session store (replace with Redis/DB in production)
const sessions = new Map<string, UserSession>();

function getSession(phoneNumber: string): UserSession {
  if (!sessions.has(phoneNumber)) {
    sessions.set(phoneNumber, {
      language: 'es', // Default to Spanish
      currentNode: 'welcome',
      budgetData: {},
    });
  }
  return sessions.get(phoneNumber)!;
}

function setSession(phoneNumber: string, session: UserSession): void {
  sessions.set(phoneNumber, session);
}

function extractActionId(message: IncomingMessage): string | null {
  if (message.interactive?.button_reply) {
    return message.interactive.button_reply.id;
  }
  if (message.interactive?.list_reply) {
    return message.interactive.list_reply.id;
  }
  if (message.text?.body) {
    return message.text.body.trim().toLowerCase();
  }
  return null;
}

export async function routeMessage(message: IncomingMessage): Promise<void> {
  const from = message.from;
  let session = getSession(from);
  const actionId = extractActionId(message);

  if (!actionId) return;

  // Language switching
  if (actionId === 'english' || actionId === 'en') {
    session = { ...session, language: 'en' };
    setSession(from, session);
    const updated = await handleWelcome(from, session);
    setSession(from, updated);
    return;
  }
  if (actionId === 'español' || actionId === 'es') {
    session = { ...session, language: 'es' };
    setSession(from, session);
    const updated = await handleWelcome(from, session);
    setSession(from, updated);
    return;
  }

  // Route to correct handler based on action
  let updatedSession: UserSession;

  switch (actionId) {
    case 'backToMenu':
    case 'start':
    case 'menu':
    case 'hola':
    case 'hello':
    case 'hi':
      updatedSession = await handleWelcome(from, session);
      break;

    case 'financial':
      updatedSession = await handleFinancialMenu(from, session);
      break;

    case 'legal':
      updatedSession = await handleLegalMenu(from, session);
      break;

    case 'community':
      updatedSession = await handleCommunityMenu(from, session);
      break;

    case 'emergency':
      updatedSession = await handleEmergency(from, session);
      break;

    // Financial sub-actions
    case 'itin':
    case 'credit':
    case 'remittances':
    case 'bankAccount':
    case 'budget':
      updatedSession = await handleFinancialAction(from, actionId, session);
      break;

    // Legal sub-actions
    case 'rights':
    case 'visas':
    case 'documents':
    case 'directory':
      updatedSession = await handleLegalAction(from, actionId, session);
      break;

    // Community sub-actions
    case 'health':
    case 'education':
    case 'housing':
    case 'events':
      updatedSession = await handleCommunityAction(from, actionId, session);
      break;

    default:
      // Unknown input — restart
      updatedSession = await handleWelcome(from, session);
      break;
  }

  setSession(from, updatedSession);
}
