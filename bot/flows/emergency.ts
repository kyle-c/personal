import type { UserSession } from '../types';
import { sendTextMessage, sendInteractiveButtons } from '../services/whatsapp';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

const strings = { en, es };

export async function handleEmergency(to: string, session: UserSession): Promise<UserSession> {
  const s = strings[session.language];

  await sendTextMessage(to, s.emergency.title);
  await sendInteractiveButtons(to, s.emergency.rights, [
    { id: 'rights', title: s.emergency.rights.slice(0, 20) },
    { id: 'backToMenu', title: s.emergency.back.slice(0, 20) },
  ]);

  return { ...session, currentNode: 'emergency' };
}
