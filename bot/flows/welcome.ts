import type { Language, UserSession } from '../types';
import { sendInteractiveButtons } from '../services/whatsapp';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

const strings = { en, es };

export async function handleWelcome(to: string, session: UserSession): Promise<UserSession> {
  const s = strings[session.language];

  await sendInteractiveButtons(to, s.welcome, [
    { id: 'financial', title: s.mainMenu.financial.slice(0, 20) },
    { id: 'legal', title: s.mainMenu.legal.slice(0, 20) },
    { id: 'community', title: s.mainMenu.community.slice(0, 20) },
  ]);

  // Send emergency as a follow-up since WhatsApp only allows 3 buttons
  await sendInteractiveButtons(to, s.mainMenu.emergency, [
    { id: 'emergency', title: s.mainMenu.emergency.slice(0, 20) },
  ]);

  return { ...session, currentNode: 'welcome' };
}
