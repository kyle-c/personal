import type { Language, UserSession } from '../types';
import { sendListMessage, sendTextMessage, sendInteractiveButtons } from '../services/whatsapp';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

const strings = { en, es };

export async function handleFinancialMenu(to: string, session: UserSession): Promise<UserSession> {
  const s = strings[session.language];

  await sendListMessage(to, s.financial.title, s.menuButton, [
    {
      title: s.financial.title.split('\n')[0],
      rows: [
        { id: 'budget', title: s.financial.budget },
        { id: 'itin', title: s.financial.itin },
        { id: 'credit', title: s.financial.credit },
        { id: 'remittances', title: s.financial.remittances },
        { id: 'bankAccount', title: s.financial.bankAccount },
        { id: 'backToMenu', title: s.financial.back },
      ],
    },
  ]);

  return { ...session, currentNode: 'financial-menu' };
}

export async function handleFinancialAction(
  to: string,
  actionId: string,
  session: UserSession
): Promise<UserSession> {
  const s = strings[session.language];
  const lang = session.language;

  const contentMap: Record<string, string> = {
    itin: lang === 'es'
      ? '🔢 Guía ITIN\n\nEl ITIN te permite:\n✅ Declarar impuestos\n✅ Abrir cuenta bancaria\n✅ Construir crédito\n✅ Obtener licencia (algunos estados)\n\nRequisitos: Formulario W-7, declaración de impuestos, identificación válida.\n\nTiempo: 7-11 semanas'
      : '🔢 ITIN Guide\n\nThe ITIN allows you to:\n✅ File taxes\n✅ Open a bank account\n✅ Build credit\n✅ Get a license (some states)\n\nRequirements: Form W-7, tax return, valid ID.\n\nProcessing: 7-11 weeks',
    credit: lang === 'es'
      ? '📈 Construir Crédito sin SSN\n\n1️⃣ Obtén un ITIN\n2️⃣ Tarjeta asegurada ($200-500)\n3️⃣ Usuario autorizado\n4️⃣ Paga a tiempo siempre\n5️⃣ Uso bajo 30%'
      : '📈 Build Credit Without SSN\n\n1️⃣ Get an ITIN\n2️⃣ Secured card ($200-500)\n3️⃣ Authorized user\n4️⃣ Pay on time always\n5️⃣ Keep usage under 30%',
    remittances: lang === 'es'
      ? '💸 Comparar Remesas\n\nRemitly: $0-3.99\nWise: Variable (bajo)\nWestern Union: $5-10\nBanco: $25-45\n\n💡 Compara costo TOTAL'
      : '💸 Compare Remittances\n\nRemitly: $0-3.99\nWise: Variable (low)\nWestern Union: $5-10\nBank: $25-45\n\n💡 Compare TOTAL cost',
    bankAccount: lang === 'es'
      ? '🏦 Abrir Cuenta\n\nNecesitas: ITIN, ID con foto, comprobante de domicilio, depósito $25-100.\n\nBancos con ITIN: Bank of America, Wells Fargo, cooperativas locales.'
      : '🏦 Open Account\n\nYou need: ITIN, photo ID, proof of address, deposit $25-100.\n\nBanks with ITIN: Bank of America, Wells Fargo, local credit unions.',
  };

  const content = contentMap[actionId];
  if (content) {
    await sendTextMessage(to, content);
    await sendInteractiveButtons(to, s.back, [
      { id: 'financial', title: s.financial.back.slice(0, 20) },
      { id: 'backToMenu', title: s.backToMenu.slice(0, 20) },
    ]);
    return { ...session, currentNode: `financial-${actionId}` };
  }

  return session;
}
