import type { UserSession } from '../types';
import { sendListMessage, sendTextMessage, sendInteractiveButtons } from '../services/whatsapp';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

const strings = { en, es };

export async function handleLegalMenu(to: string, session: UserSession): Promise<UserSession> {
  const s = strings[session.language];

  await sendListMessage(to, s.legal.title, s.menuButton, [
    {
      title: s.legal.title.split('\n')[0],
      rows: [
        { id: 'rights', title: s.legal.rights },
        { id: 'visas', title: s.legal.visas },
        { id: 'documents', title: s.legal.documents },
        { id: 'directory', title: s.legal.directory },
        { id: 'emergency', title: s.legal.emergency },
        { id: 'backToMenu', title: s.legal.back },
      ],
    },
  ]);

  return { ...session, currentNode: 'legal-menu' };
}

export async function handleLegalAction(
  to: string,
  actionId: string,
  session: UserSession
): Promise<UserSession> {
  const s = strings[session.language];
  const lang = session.language;

  const contentMap: Record<string, string> = {
    rights: lang === 'es'
      ? '✊ Conoce Tus Derechos\n\nSi ICE llega a tu puerta:\n✅ NO abras la puerta\n✅ Pide orden judicial firmada por juez\n✅ Tienes derecho a guardar silencio\n✅ Tienes derecho a un abogado\n✅ NO firmes nada que no entiendas'
      : '✊ Know Your Rights\n\nIf ICE comes to your door:\n✅ Do NOT open the door\n✅ Ask for a judicial warrant signed by a judge\n✅ You have the right to remain silent\n✅ You have the right to an attorney\n✅ Do NOT sign anything you don\'t understand',
    visas: lang === 'es'
      ? '🛂 Tipos de Visa\n\n👨‍👩‍👧‍👦 Familiar: Esposo/a, hijo/a, padre/madre de ciudadano\n💼 Empleo: H-1B, L-1, categorías EB\n🛡️ Humanitaria: Asilo, TPS, DACA, Visa U/T, VAWA\n\n⚠️ Consulta con un abogado de inmigración'
      : '🛂 Visa Types\n\n👨‍👩‍👧‍👦 Family: Spouse, child, parent of citizen\n💼 Employment: H-1B, L-1, EB categories\n🛡️ Humanitarian: Asylum, TPS, DACA, U/T Visa, VAWA\n\n⚠️ Always consult an immigration attorney',
    documents: lang === 'es'
      ? '📝 Listas de Documentos\n\nDACA: I-821D, I-765, fotos, ID, prueba residencia, $495\nTPS: I-821, I-765, fotos, pasaporte, prueba residencia\n\n📌 Verifica requisitos actuales con un abogado'
      : '📝 Document Checklists\n\nDACA: I-821D, I-765, photos, ID, residence proof, $495\nTPS: I-821, I-765, photos, passport, residence proof\n\n📌 Verify current requirements with a lawyer',
    directory: lang === 'es'
      ? '🏛️ Ayuda Legal\n\n• RAICES: (210) 222-0157\n• Caridades Católicas: Busca local\n• Legal Aid Society: (212) 577-3300\n• CLINIC: Red nacional\n• NIJC: (312) 660-1370\n\n⚠️ NUNCA pagues a un notario por consejo legal'
      : '🏛️ Legal Aid\n\n• RAICES: (210) 222-0157\n• Catholic Charities: Find local\n• Legal Aid Society: (212) 577-3300\n• CLINIC: National network\n• NIJC: (312) 660-1370\n\n⚠️ NEVER pay a notario for legal advice',
  };

  const content = contentMap[actionId];
  if (content) {
    await sendTextMessage(to, content);
    await sendInteractiveButtons(to, s.back, [
      { id: 'legal', title: s.legal.back.slice(0, 20) },
      { id: 'backToMenu', title: s.backToMenu.slice(0, 20) },
    ]);
    return { ...session, currentNode: `legal-${actionId}` };
  }

  return session;
}
