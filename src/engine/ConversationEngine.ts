import type { Message, Language, BudgetSummary, ButtonOption } from '../types';
import { flowNodes } from '../data/flows';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

type Strings = typeof en;

const strings: Record<Language, Strings> = { en, es };

let messageCounter = 0;
function nextId(): string {
  return `msg-${++messageCounter}`;
}

function now(): Date {
  return new Date();
}

/** Nodes that render as list messages (4+ options) */
const LIST_NODES = [
  'all-services',
  'send-money-delivery',
  'send-money-pay',
  'find-work-skills',
  'my-community',
  'financial-menu',
  'legal-menu',
  'community-menu',
  'document-checklists',
  'resource-finder',
];

/** Delivery method labels */
const deliveryLabels: Record<string, { en: string; es: string }> = {
  cashPickup: { en: 'Cash Pickup', es: 'Retiro en Efectivo' },
  bankAccount: { en: 'Bank Account', es: 'Cuenta Bancaria' },
  digitalWallet: { en: 'Digital Wallet', es: 'Billetera Digital' },
  mobileTopUp: { en: 'Mobile Top-Up', es: 'Recarga Móvil' },
  billPay: { en: 'Bill Pay', es: 'Pago de Facturas' },
};

/** Payment method labels */
const paymentLabels: Record<string, { en: string; es: string }> = {
  debitCard: { en: 'Debit Card', es: 'Tarjeta de Débito' },
  creditCard: { en: 'Credit Card', es: 'Tarjeta de Crédito' },
  applePay: { en: 'Apple/Google Pay', es: 'Apple/Google Pay' },
  ach: { en: 'ACH Transfer', es: 'Transferencia ACH' },
  cash: { en: 'Cash at Store', es: 'Efectivo en Tienda' },
};

/** Generate fake job listings for a skill in a location */
function generateJobListings(location: string, skillId: string, lang: Language): string {
  const s = strings[lang];
  const skillLabels: Record<string, { en: string; es: string }> = {
    construction: { en: 'Construction', es: 'Construcción' },
    cleaning: { en: 'Cleaning', es: 'Limpieza' },
    restaurant: { en: 'Restaurant / Kitchen', es: 'Restaurante / Cocina' },
    landscaping: { en: 'Landscaping', es: 'Jardinería' },
    warehouse: { en: 'Warehouse', es: 'Almacén' },
    childcare: { en: 'Childcare', es: 'Cuidado de Niños' },
    driving: { en: 'Driving / Delivery', es: 'Manejo / Entregas' },
    other: { en: 'General', es: 'General' },
  };

  const skill = skillLabels[skillId]?.[lang] || skillId;

  const jobTemplates: Record<string, { en: string; es: string }[]> = {
    construction: [
      { en: '🔨 General Laborer — $18-22/hr\n📍 ABC Construction, ${loc}\n📞 (555) 123-4567', es: '🔨 Obrero General — $18-22/hr\n📍 ABC Construction, ${loc}\n📞 (555) 123-4567' },
      { en: '🔨 Framing Helper — $20-25/hr\n📍 BuildRight Inc, ${loc}\n📞 (555) 234-5678', es: '🔨 Ayudante de Estructura — $20-25/hr\n📍 BuildRight Inc, ${loc}\n📞 (555) 234-5678' },
      { en: '🔨 Concrete Worker — $19-24/hr\n📍 Metro Builders, ${loc}\n📞 (555) 345-6789', es: '🔨 Trabajador de Concreto — $19-24/hr\n📍 Metro Builders, ${loc}\n📞 (555) 345-6789' },
    ],
    cleaning: [
      { en: '🧹 House Cleaner — $16-20/hr\n📍 CleanPro Services, ${loc}\n📞 (555) 456-7890', es: '🧹 Limpieza de Casas — $16-20/hr\n📍 CleanPro Services, ${loc}\n📞 (555) 456-7890' },
      { en: '🧹 Office Cleaner (Nights) — $15-18/hr\n📍 SparkleClean, ${loc}\n📞 (555) 567-8901', es: '🧹 Limpieza de Oficinas (Noches) — $15-18/hr\n📍 SparkleClean, ${loc}\n📞 (555) 567-8901' },
      { en: '🧹 Hotel Housekeeper — $15-19/hr\n📍 Grand Hotel, ${loc}\n📞 (555) 678-9012', es: '🧹 Camarista de Hotel — $15-19/hr\n📍 Grand Hotel, ${loc}\n📞 (555) 678-9012' },
    ],
    restaurant: [
      { en: '🍳 Line Cook — $16-20/hr\n📍 El Sabor Restaurant, ${loc}\n📞 (555) 789-0123', es: '🍳 Cocinero de Línea — $16-20/hr\n📍 El Sabor Restaurant, ${loc}\n📞 (555) 789-0123' },
      { en: '🍳 Dishwasher — $14-16/hr\n📍 Downtown Grill, ${loc}\n📞 (555) 890-1234', es: '🍳 Lavaplatos — $14-16/hr\n📍 Downtown Grill, ${loc}\n📞 (555) 890-1234' },
      { en: '🍳 Prep Cook — $15-18/hr\n📍 Fresh Kitchen, ${loc}\n📞 (555) 901-2345', es: '🍳 Cocinero de Preparación — $15-18/hr\n📍 Fresh Kitchen, ${loc}\n📞 (555) 901-2345' },
    ],
    landscaping: [
      { en: '🌿 Landscaper — $16-20/hr\n📍 Green Valley Landscaping, ${loc}\n📞 (555) 012-3456', es: '🌿 Jardinero — $16-20/hr\n📍 Green Valley Landscaping, ${loc}\n📞 (555) 012-3456' },
      { en: '🌿 Lawn Care Crew — $15-18/hr\n📍 TurfMasters, ${loc}\n📞 (555) 123-7890', es: '🌿 Equipo de Césped — $15-18/hr\n📍 TurfMasters, ${loc}\n📞 (555) 123-7890' },
    ],
    warehouse: [
      { en: '📦 Warehouse Worker — $17-21/hr\n📍 FastShip Logistics, ${loc}\n📞 (555) 234-8901', es: '📦 Trabajador de Almacén — $17-21/hr\n📍 FastShip Logistics, ${loc}\n📞 (555) 234-8901' },
      { en: '📦 Packer/Sorter — $15-18/hr\n📍 QuickBox Inc, ${loc}\n📞 (555) 345-9012', es: '📦 Empacador/Clasificador — $15-18/hr\n📍 QuickBox Inc, ${loc}\n📞 (555) 345-9012' },
    ],
    childcare: [
      { en: '👶 Nanny — $15-22/hr\n📍 Care.com listings, ${loc}\n📞 Visit care.com', es: '👶 Niñera — $15-22/hr\n📍 Care.com listados, ${loc}\n📞 Visita care.com' },
      { en: '👶 Daycare Assistant — $14-17/hr\n📍 Little Stars Daycare, ${loc}\n📞 (555) 456-0123', es: '👶 Asistente de Guardería — $14-17/hr\n📍 Little Stars Daycare, ${loc}\n📞 (555) 456-0123' },
    ],
    driving: [
      { en: '🚗 Delivery Driver — $18-25/hr + tips\n📍 Multiple platforms, ${loc}\n💡 DoorDash, UberEats, Instacart', es: '🚗 Conductor de Entregas — $18-25/hr + propinas\n📍 Múltiples plataformas, ${loc}\n💡 DoorDash, UberEats, Instacart' },
      { en: '🚗 Box Truck Driver — $20-28/hr\n📍 MoveFast Delivery, ${loc}\n📞 (555) 567-1234', es: '🚗 Conductor de Camión — $20-28/hr\n📍 MoveFast Delivery, ${loc}\n📞 (555) 567-1234' },
    ],
    other: [
      { en: '💼 Day Labor — $15-25/hr\n📍 Labor Ready, ${loc}\n📞 (555) 678-2345', es: '💼 Trabajo por Día — $15-25/hr\n📍 Labor Ready, ${loc}\n📞 (555) 678-2345' },
      { en: '💼 Temp Agency — Various\n📍 PeopleReady, ${loc}\n📞 (555) 789-3456', es: '💼 Agencia Temporal — Varios\n📍 PeopleReady, ${loc}\n📞 (555) 789-3456' },
    ],
  };

  const jobs = jobTemplates[skillId] || jobTemplates.other;
  const header = lang === 'en'
    ? `💼 ${skill} Jobs in ${location}\n\nHere's what we found:`
    : `💼 Trabajos de ${skill} en ${location}\n\nEsto es lo que encontramos:`;

  const listings = jobs.map(j => j[lang].replace(/\$\{loc\}/g, location)).join('\n\n');
  return `${header}\n\n${listings}`;
}

/** Get the i18n string map for a given node and language */
function getNodeContent(nodeId: string, lang: Language): string {
  const s = strings[lang];

  const contentMap: Record<string, string> = {
    welcome: s.welcome.greeting,
    'all-services': s.allServices.title,
    'send-money-start': s.sendMoney.askRecipient,
    'send-money-amount': s.sendMoney.gotRecipient,
    'send-money-delivery': s.sendMoney.deliveryTitle,
    'send-money-pay': s.sendMoney.payTitle,
    'send-money-success': s.sendMoney.successTitle,
    'find-work-start': s.findWork.askLocation,
    'find-work-skills': s.findWork.askSkills,
    'find-work-apply': s.findWork.applyGuide,
    'my-community': s.myCommunity.title,
    'community-legal-clinic': s.myCommunity.legalClinicContent,
    'community-tax-prep': s.myCommunity.taxPrepContent,
    'community-esl': s.myCommunity.eslContent,
    'financial-menu': s.financial.title,
    'budget-start': s.budget.intro,
    'budget-income': s.budget.gotIncome,
    'budget-rent': s.budget.gotRent,
    'budget-food': s.budget.gotFood,
    'budget-transport': s.budget.gotTransport,
    'savings-tips': s.budget.savingsTipsContent,
    'itin-guide': s.itin.content,
    'credit-guide': s.credit.content,
    'bank-account-guide': s.bankAccount.content,
    'legal-menu': s.legal.title,
    'know-your-rights': s.rights.iceAtDoor,
    'workplace-rights': s.rights.workplace,
    'visa-pathways': s.visas.content,
    'daca-checklist': s.documents.dacaTitle,
    'tps-checklist': s.documents.tpsTitle,
    'legal-directory': s.legalDirectory.orgs,
    'community-menu': s.community.title,
    'health-resources': s.communityResources.health,
    'education-resources': s.communityResources.education,
    'housing-resources': s.communityResources.housing,
    emergency: s.emergencyFlow.title,
  };

  return contentMap[nodeId] || '';
}

/** Get buttons for a node */
function getNodeButtons(nodeId: string, lang: Language): ButtonOption[] {
  const buttonMap: Record<string, ButtonOption[]> = {
    welcome: [
      { id: 'sendMoney', label: { en: en.welcome.sendMoney, es: es.welcome.sendMoney } },
      { id: 'findWork', label: { en: en.welcome.findWork, es: es.welcome.findWork } },
      { id: 'myCommunity', label: { en: en.welcome.myCommunity, es: es.welcome.myCommunity } },
    ],
    'send-money-success': [
      { id: 'sendAnother', label: { en: en.sendMoney.sendAnother, es: es.sendMoney.sendAnother } },
      { id: 'backToMenu', label: { en: en.sendMoney.backToMenu, es: es.sendMoney.backToMenu } },
    ],
    'find-work-results': [
      { id: 'applyNow', label: { en: en.findWork.applyNow, es: es.findWork.applyNow } },
      { id: 'moreJobs', label: { en: en.findWork.moreJobs, es: es.findWork.moreJobs } },
      { id: 'backToMenu', label: { en: en.findWork.backToMenu, es: es.findWork.backToMenu } },
    ],
    'find-work-apply': [
      { id: 'back', label: { en: en.findWork.back, es: es.findWork.back } },
      { id: 'backToMenu', label: { en: en.findWork.backToMenu, es: es.findWork.backToMenu } },
    ],
    'community-legal-clinic': [
      { id: 'back', label: { en: en.myCommunity.back, es: es.myCommunity.back } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    'community-tax-prep': [
      { id: 'back', label: { en: en.myCommunity.back, es: es.myCommunity.back } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    'community-esl': [
      { id: 'back', label: { en: en.myCommunity.back, es: es.myCommunity.back } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    'itin-guide': [
      { id: 'back', label: { en: en.itin.back, es: es.itin.back } },
    ],
    'credit-guide': [
      { id: 'back', label: { en: en.credit.back, es: es.credit.back } },
    ],
    'bank-account-guide': [
      { id: 'back', label: { en: en.bankAccount.back, es: es.bankAccount.back } },
    ],
    'know-your-rights': [
      { id: 'workplaceRights', label: { en: en.rights.workplaceRights, es: es.rights.workplaceRights } },
      { id: 'callLegal', label: { en: en.rights.callLegal, es: es.rights.callLegal } },
      { id: 'back', label: { en: en.rights.back, es: es.rights.back } },
    ],
    'workplace-rights': [
      { id: 'callLegal', label: { en: en.rights.callLegal, es: es.rights.callLegal } },
      { id: 'back', label: { en: en.rights.back, es: es.rights.back } },
    ],
    'visa-pathways': [
      { id: 'findLawyer', label: { en: en.visas.findLawyer, es: es.visas.findLawyer } },
      { id: 'back', label: { en: en.visas.back, es: es.visas.back } },
    ],
    'daca-checklist': [
      { id: 'findLawyer', label: { en: '🏛️ Find Lawyer', es: '🏛️ Encontrar Abogado' } },
      { id: 'back', label: { en: en.documents.back, es: es.documents.back } },
    ],
    'tps-checklist': [
      { id: 'findLawyer', label: { en: '🏛️ Find Lawyer', es: '🏛️ Encontrar Abogado' } },
      { id: 'back', label: { en: en.documents.back, es: es.documents.back } },
    ],
    'legal-directory': [
      { id: 'back', label: { en: en.legalDirectory.back, es: es.legalDirectory.back } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    'health-resources': [
      { id: 'back', label: { en: en.communityResources.back, es: es.communityResources.back } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    'education-resources': [
      { id: 'back', label: { en: en.communityResources.back, es: es.communityResources.back } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    'housing-resources': [
      { id: 'back', label: { en: en.communityResources.back, es: es.communityResources.back } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    'savings-tips': [
      { id: 'back', label: { en: '◀️ Back', es: '◀️ Volver' } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    'budget-other': [
      { id: 'savingsTips', label: { en: en.budget.savingsTips, es: es.budget.savingsTips } },
      { id: 'sendRemittance', label: { en: en.budget.sendRemittance, es: es.budget.sendRemittance } },
      { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
    ],
    emergency: [
      { id: 'rightsBtn', label: { en: en.emergencyFlow.rightsBtn, es: es.emergencyFlow.rightsBtn } },
      { id: 'backToMenu', label: { en: en.emergencyFlow.backToMenu, es: es.emergencyFlow.backToMenu } },
    ],
  };

  return buttonMap[nodeId] || [];
}

/** Get list items for list-type nodes */
function getNodeListItems(nodeId: string): ButtonOption[] {
  const listMap: Record<string, ButtonOption[]> = {
    'all-services': [
      { id: 'sendMoney', label: { en: en.allServices.sendMoney, es: es.allServices.sendMoney } },
      { id: 'findWork', label: { en: en.allServices.findWork, es: es.allServices.findWork } },
      { id: 'myCommunity', label: { en: en.allServices.myCommunity, es: es.allServices.myCommunity } },
      { id: 'budgetCalc', label: { en: en.allServices.budgetCalc, es: es.allServices.budgetCalc } },
      { id: 'getITIN', label: { en: en.allServices.getITIN, es: es.allServices.getITIN } },
      { id: 'buildCredit', label: { en: en.allServices.buildCredit, es: es.allServices.buildCredit } },
      { id: 'openBank', label: { en: en.allServices.openBank, es: es.allServices.openBank } },
      { id: 'findHealthcare', label: { en: en.allServices.findHealthcare, es: es.allServices.findHealthcare } },
      { id: 'findHousing', label: { en: en.allServices.findHousing, es: es.allServices.findHousing } },
      { id: 'getEducation', label: { en: en.allServices.getEducation, es: es.allServices.getEducation } },
      { id: 'legalHelp', label: { en: en.allServices.legalHelp, es: es.allServices.legalHelp } },
      { id: 'backToMenu', label: { en: en.allServices.backToMenu, es: es.allServices.backToMenu } },
    ],
    'send-money-delivery': [
      { id: 'cashPickup', label: { en: en.sendMoney.cashPickup, es: es.sendMoney.cashPickup } },
      { id: 'bankAccount', label: { en: en.sendMoney.bankAccount, es: es.sendMoney.bankAccount } },
      { id: 'digitalWallet', label: { en: en.sendMoney.digitalWallet, es: es.sendMoney.digitalWallet } },
      { id: 'mobileTopUp', label: { en: en.sendMoney.mobileTopUp, es: es.sendMoney.mobileTopUp } },
      { id: 'billPay', label: { en: en.sendMoney.billPay, es: es.sendMoney.billPay } },
    ],
    'send-money-pay': [
      { id: 'debitCard', label: { en: en.sendMoney.debitCard, es: es.sendMoney.debitCard } },
      { id: 'creditCard', label: { en: en.sendMoney.creditCard, es: es.sendMoney.creditCard } },
      { id: 'applePay', label: { en: en.sendMoney.applePay, es: es.sendMoney.applePay } },
      { id: 'ach', label: { en: en.sendMoney.ach, es: es.sendMoney.ach } },
      { id: 'cash', label: { en: en.sendMoney.cash, es: es.sendMoney.cash } },
    ],
    'find-work-skills': [
      { id: 'construction', label: { en: en.findWork.construction, es: es.findWork.construction } },
      { id: 'cleaning', label: { en: en.findWork.cleaning, es: es.findWork.cleaning } },
      { id: 'restaurant', label: { en: en.findWork.restaurant, es: es.findWork.restaurant } },
      { id: 'landscaping', label: { en: en.findWork.landscaping, es: es.findWork.landscaping } },
      { id: 'warehouse', label: { en: en.findWork.warehouse, es: es.findWork.warehouse } },
      { id: 'childcare', label: { en: en.findWork.childcare, es: es.findWork.childcare } },
      { id: 'driving', label: { en: en.findWork.driving, es: es.findWork.driving } },
      { id: 'other', label: { en: en.findWork.other, es: es.findWork.other } },
    ],
    'my-community': [
      { id: 'legalClinic', label: { en: en.myCommunity.legalClinic, es: es.myCommunity.legalClinic } },
      { id: 'taxPrep', label: { en: en.myCommunity.taxPrep, es: es.myCommunity.taxPrep } },
      { id: 'eslClasses', label: { en: en.myCommunity.eslClasses, es: es.myCommunity.eslClasses } },
      { id: 'healthcare', label: { en: en.myCommunity.healthcare, es: es.myCommunity.healthcare } },
      { id: 'housing', label: { en: en.myCommunity.housing, es: es.myCommunity.housing } },
      { id: 'jobFairs', label: { en: en.myCommunity.jobFairs, es: es.myCommunity.jobFairs } },
      { id: 'knowRights', label: { en: en.myCommunity.knowRights, es: es.myCommunity.knowRights } },
      { id: 'backToMenu', label: { en: en.myCommunity.backToMenu, es: es.myCommunity.backToMenu } },
    ],
    'financial-menu': [
      { id: 'budget', label: { en: en.financial.budget, es: es.financial.budget } },
      { id: 'itin', label: { en: en.financial.itin, es: es.financial.itin } },
      { id: 'credit', label: { en: en.financial.credit, es: es.financial.credit } },
      { id: 'remittances', label: { en: en.financial.remittances, es: es.financial.remittances } },
      { id: 'bankAccount', label: { en: en.financial.bankAccount, es: es.financial.bankAccount } },
      { id: 'backToMenu', label: { en: en.financial.backToMenu, es: es.financial.backToMenu } },
    ],
    'legal-menu': [
      { id: 'rights', label: { en: en.legal.rights, es: es.legal.rights } },
      { id: 'visas', label: { en: en.legal.visas, es: es.legal.visas } },
      { id: 'documents', label: { en: en.legal.documents, es: es.legal.documents } },
      { id: 'directory', label: { en: en.legal.directory, es: es.legal.directory } },
      { id: 'emergencyContacts', label: { en: en.legal.emergencyContacts, es: es.legal.emergencyContacts } },
      { id: 'backToMenu', label: { en: en.legal.backToMenu, es: es.legal.backToMenu } },
    ],
    'community-menu': [
      { id: 'search', label: { en: en.community.search, es: es.community.search } },
      { id: 'health', label: { en: en.community.health, es: es.community.health } },
      { id: 'education', label: { en: en.community.education, es: es.community.education } },
      { id: 'housing', label: { en: en.community.housing, es: es.community.housing } },
      { id: 'events', label: { en: en.community.events, es: es.community.events } },
      { id: 'backToMenu', label: { en: en.community.backToMenu, es: es.community.backToMenu } },
    ],
    'document-checklists': [
      { id: 'daca', label: { en: en.documents.daca, es: es.documents.daca } },
      { id: 'tps', label: { en: en.documents.tps, es: es.documents.tps } },
      { id: 'back', label: { en: en.documents.back, es: es.documents.back } },
    ],
    'resource-finder': [
      { id: 'health', label: { en: en.communityResources.healthBtn, es: es.communityResources.healthBtn } },
      { id: 'education', label: { en: en.communityResources.educationBtn, es: es.communityResources.educationBtn } },
      { id: 'housing', label: { en: en.communityResources.housingBtn, es: es.communityResources.housingBtn } },
      { id: 'back', label: { en: '◀️ Back', es: '◀️ Volver' } },
    ],
  };

  return listMap[nodeId] || [];
}

export interface EngineState {
  currentNode: string;
  messages: Message[];
  budgetData: Partial<BudgetSummary>;
  budgetStep: string | null;
  sendMoneyRecipient?: string;
  sendMoneyAmount?: number;
  sendMoneyDelivery?: string;
  sendMoneyPayment?: string;
  findWorkLocation?: string;
  findWorkSkill?: string;
}

export function createInitialState(): EngineState {
  return {
    currentNode: 'welcome',
    messages: [],
    budgetData: {},
    budgetStep: null,
  };
}

export function getWelcomeMessages(lang: Language): Message[] {
  const content = getNodeContent('welcome', lang);
  const buttons = getNodeButtons('welcome', lang);

  return [
    {
      id: nextId(),
      type: 'buttons',
      sender: 'bot',
      content: { en: content, es: content },
      timestamp: now(),
      status: 'read',
      buttons,
    },
  ];
}

export function processAction(
  state: EngineState,
  actionId: string,
  lang: Language
): { newState: EngineState; newMessages: Message[] } {
  const node = flowNodes[state.currentNode];
  if (!node) return { newState: state, newMessages: [] };

  // Custom handling for send-money-delivery: store delivery method, show payment options
  if (state.currentNode === 'send-money-delivery' && node.transitions[actionId]) {
    const delivery = deliveryLabels[actionId]?.[lang] || actionId;
    const s = strings[lang];
    const content = s.sendMoney.payTitle;
    const listItems = getNodeListItems('send-money-pay');

    const msg: Message = {
      id: nextId(),
      type: 'list',
      sender: 'bot',
      content: { en: content, es: content },
      timestamp: now(),
      status: 'read',
      buttons: listItems,
      listButtonText: { en: 'View Options', es: 'Ver Opciones' },
    };

    return {
      newState: {
        ...state,
        currentNode: 'send-money-pay',
        sendMoneyDelivery: delivery,
        messages: [...state.messages, msg],
      },
      newMessages: [msg],
    };
  }

  // Custom handling for send-money-pay: build summary, show success
  if (state.currentNode === 'send-money-pay' && node.transitions[actionId]) {
    const payment = paymentLabels[actionId]?.[lang] || actionId;
    const s = strings[lang];
    const recipient = state.sendMoneyRecipient || '—';
    const amount = state.sendMoneyAmount || 0;
    const delivery = state.sendMoneyDelivery || '—';

    const summaryLines = lang === 'en'
      ? `👤 To: ${recipient}\n💵 Amount: $${amount.toLocaleString()}\n📦 Delivery: ${delivery}\n💳 Payment: ${payment}`
      : `👤 Para: ${recipient}\n💵 Monto: $${amount.toLocaleString()}\n📦 Entrega: ${delivery}\n💳 Pago: ${payment}`;

    const successText = s.sendMoney.successTitle.replace('${summary}', summaryLines);
    const buttons = getNodeButtons('send-money-success', lang);

    const msg: Message = {
      id: nextId(),
      type: 'buttons',
      sender: 'bot',
      content: { en: successText, es: successText },
      timestamp: now(),
      status: 'read',
      buttons,
    };

    return {
      newState: {
        ...state,
        currentNode: 'send-money-success',
        sendMoneyPayment: payment,
        messages: [...state.messages, msg],
      },
      newMessages: [msg],
    };
  }

  // Custom handling for find-work-skills: generate job listings
  if (state.currentNode === 'find-work-skills' && node.transitions[actionId]) {
    const location = state.findWorkLocation || '—';
    const jobContent = generateJobListings(location, actionId, lang);
    const buttons = getNodeButtons('find-work-results', lang);

    const msg: Message = {
      id: nextId(),
      type: 'buttons',
      sender: 'bot',
      content: { en: jobContent, es: jobContent },
      timestamp: now(),
      status: 'read',
      buttons,
    };

    return {
      newState: {
        ...state,
        currentNode: 'find-work-results',
        findWorkSkill: actionId,
        messages: [...state.messages, msg],
      },
      newMessages: [msg],
    };
  }

  const nextNodeId = node.transitions[actionId];
  if (!nextNodeId) return { newState: state, newMessages: [] };

  return navigateToNode(state, nextNodeId, lang);
}

export function processTextInput(
  state: EngineState,
  text: string,
  lang: Language
): { newState: EngineState; newMessages: Message[] } {
  // Handle keywords from any screen
  const lower = text.trim().toLowerCase();
  if (['emergency', 'emergencia', '911', 'sos'].includes(lower)) {
    return navigateToNode(state, 'emergency', lang);
  }
  if (['menu', 'menú', 'services', 'servicios', 'all', 'todo'].includes(lower)) {
    return navigateToNode(state, 'all-services', lang);
  }

  const node = flowNodes[state.currentNode];
  if (!node || !node.expectsInput || !node.inputHandler) {
    return { newState: state, newMessages: [] };
  }

  // ── Send Money: capture recipient name ──
  if (state.currentNode === 'send-money-start') {
    const name = text.trim();
    if (!name) return { newState: state, newMessages: [] };

    const s = strings[lang];
    const content = s.sendMoney.gotRecipient.replace('${name}', name);

    const msg: Message = {
      id: nextId(),
      type: 'text',
      sender: 'bot',
      content: { en: content, es: content },
      timestamp: now(),
      status: 'read',
    };

    return {
      newState: {
        ...state,
        currentNode: 'send-money-amount',
        sendMoneyRecipient: name,
        messages: [...state.messages, msg],
      },
      newMessages: [msg],
    };
  }

  // ── Send Money: capture amount ──
  if (state.currentNode === 'send-money-amount') {
    const num = parseFloat(text.replace(/[,$]/g, ''));
    if (isNaN(num) || num <= 0) {
      const errorMsg: Message = {
        id: nextId(),
        type: 'text',
        sender: 'bot',
        content: {
          en: '⚠️ Please enter a valid amount (example: 200)',
          es: '⚠️ Por favor ingresa un monto válido (ejemplo: 200)',
        },
        timestamp: now(),
        status: 'read',
      };
      return { newState: state, newMessages: [errorMsg] };
    }

    const s = strings[lang];
    const recipient = state.sendMoneyRecipient || '—';
    const content = s.sendMoney.deliveryTitle.replace('${name}', recipient);
    const listItems = getNodeListItems('send-money-delivery');

    const msg: Message = {
      id: nextId(),
      type: 'list',
      sender: 'bot',
      content: { en: content, es: content },
      timestamp: now(),
      status: 'read',
      buttons: listItems,
      listButtonText: { en: 'View Options', es: 'Ver Opciones' },
    };

    return {
      newState: {
        ...state,
        currentNode: 'send-money-delivery',
        sendMoneyAmount: num,
        messages: [...state.messages, msg],
      },
      newMessages: [msg],
    };
  }

  // ── Find Work: capture location ──
  if (state.currentNode === 'find-work-start') {
    const location = text.trim();
    if (!location) return { newState: state, newMessages: [] };

    const s = strings[lang];
    const content = s.findWork.askSkills.replace('${location}', location);
    const listItems = getNodeListItems('find-work-skills');

    const msg: Message = {
      id: nextId(),
      type: 'list',
      sender: 'bot',
      content: { en: content, es: content },
      timestamp: now(),
      status: 'read',
      buttons: listItems,
      listButtonText: { en: 'View Options', es: 'Ver Opciones' },
    };

    return {
      newState: {
        ...state,
        currentNode: 'find-work-skills',
        findWorkLocation: location,
        messages: [...state.messages, msg],
      },
      newMessages: [msg],
    };
  }

  // ── Budget flow: numeric input ──
  const num = parseFloat(text.replace(/[,$]/g, ''));
  if (isNaN(num)) {
    const errorMsg: Message = {
      id: nextId(),
      type: 'text',
      sender: 'bot',
      content: {
        en: '⚠️ Please enter a valid number (example: 3000)',
        es: '⚠️ Por favor ingresa un número válido (ejemplo: 3000)',
      },
      timestamp: now(),
      status: 'read',
    };
    return { newState: state, newMessages: [errorMsg] };
  }

  const budgetData = { ...state.budgetData };

  switch (state.currentNode) {
    case 'budget-start':
      budgetData.income = num;
      break;
    case 'budget-income':
      budgetData.expenses = { ...budgetData.expenses, rent: num };
      break;
    case 'budget-rent':
      budgetData.expenses = { ...budgetData.expenses, food: num };
      break;
    case 'budget-food':
      budgetData.expenses = { ...budgetData.expenses, transport: num };
      break;
    case 'budget-transport':
      budgetData.expenses = { ...budgetData.expenses, other: num };
      break;
  }

  const nextNodeId = node.inputHandler;
  const nextNode = flowNodes[nextNodeId];

  if (nextNodeId === 'budget-other') {
    const totalExpenses = Object.values(budgetData.expenses || {}).reduce((a, b) => a + b, 0);
    const available = (budgetData.income || 0) - totalExpenses;
    const finalBudget: BudgetSummary = {
      income: budgetData.income || 0,
      expenses: budgetData.expenses || {},
      available,
    };

    const s = strings[lang];
    const summaryText = `${s.budget.summaryTitle}\n\n` +
      `┌─────────────────────────┐\n` +
      `│ ${s.budget.income}:    $${finalBudget.income.toLocaleString()}\n` +
      `│ ${s.budget.rent}:     -$${(finalBudget.expenses.rent || 0).toLocaleString()}\n` +
      `│ ${s.budget.food}:    -$${(finalBudget.expenses.food || 0).toLocaleString()}\n` +
      `│ ${s.budget.transport}: -$${(finalBudget.expenses.transport || 0).toLocaleString()}\n` +
      `│ ${s.budget.other}:     -$${(finalBudget.expenses.other || 0).toLocaleString()}\n` +
      `│ ─────────────────────── │\n` +
      `│ ${s.budget.available}:  $${available.toLocaleString()}\n` +
      `└─────────────────────────┘`;

    const buttons = getNodeButtons('budget-other', lang);

    const summaryMsg: Message = {
      id: nextId(),
      type: 'buttons',
      sender: 'bot',
      content: { en: summaryText, es: summaryText },
      timestamp: now(),
      status: 'read',
      buttons,
      budgetData: finalBudget,
    };

    return {
      newState: {
        ...state,
        currentNode: 'budget-other',
        budgetData,
        budgetStep: null,
        messages: [...state.messages, summaryMsg],
      },
      newMessages: [summaryMsg],
    };
  }

  // Intermediate budget step
  const content = getNodeContent(nextNodeId, lang);
  const displayContent = content.replace('${amount}', `$${num.toLocaleString()}`);

  const msg: Message = {
    id: nextId(),
    type: 'text',
    sender: 'bot',
    content: { en: displayContent, es: displayContent },
    timestamp: now(),
    status: 'read',
  };

  return {
    newState: {
      ...state,
      currentNode: nextNodeId,
      budgetData,
      messages: [...state.messages, msg],
    },
    newMessages: [msg],
  };
}

function navigateToNode(
  state: EngineState,
  nodeId: string,
  lang: Language
): { newState: EngineState; newMessages: Message[] } {
  const node = flowNodes[nodeId];
  if (!node) return { newState: state, newMessages: [] };

  const messages: Message[] = [];

  // Handle special nodes with second messages
  if (nodeId === 'emergency') {
    const s = strings[lang];
    messages.push({
      id: nextId(),
      type: 'text',
      sender: 'bot',
      content: { en: getNodeContent('emergency', lang), es: getNodeContent('emergency', lang) },
      timestamp: now(),
      status: 'read',
    });
    messages.push({
      id: nextId(),
      type: 'buttons',
      sender: 'bot',
      content: { en: s.emergencyFlow.hotlines, es: s.emergencyFlow.hotlines },
      timestamp: now(),
      status: 'read',
      buttons: getNodeButtons('emergency', lang),
    });
  } else if (nodeId === 'legal-directory') {
    const s = strings[lang];
    messages.push({
      id: nextId(),
      type: 'text',
      sender: 'bot',
      content: { en: s.legalDirectory.title, es: s.legalDirectory.title },
      timestamp: now(),
      status: 'read',
    });
    messages.push({
      id: nextId(),
      type: 'buttons',
      sender: 'bot',
      content: { en: getNodeContent('legal-directory', lang), es: getNodeContent('legal-directory', lang) },
      timestamp: now(),
      status: 'read',
      buttons: getNodeButtons('legal-directory', lang),
    });
  } else if (nodeId === 'community-events') {
    const s = strings[lang];
    messages.push({
      id: nextId(),
      type: 'text',
      sender: 'bot',
      content: { en: s.events.title, es: s.events.title },
      timestamp: now(),
      status: 'read',
    });
    messages.push({
      id: nextId(),
      type: 'buttons',
      sender: 'bot',
      content: { en: s.events.eventList, es: s.events.eventList },
      timestamp: now(),
      status: 'read',
      buttons: [
        { id: 'back', label: { en: en.events.back, es: es.events.back } },
        { id: 'backToMenu', label: { en: '◀️ Main Menu', es: '◀️ Menú Principal' } },
      ],
    });
  } else {
    // Standard node
    const content = getNodeContent(nodeId, lang);
    const isListNode = LIST_NODES.includes(nodeId);
    const buttons = getNodeButtons(nodeId, lang);
    const listItems = isListNode ? getNodeListItems(nodeId) : undefined;

    if (isListNode) {
      messages.push({
        id: nextId(),
        type: 'list',
        sender: 'bot',
        content: { en: content, es: content },
        timestamp: now(),
        status: 'read',
        buttons: listItems,
        listButtonText: { en: 'View Options', es: 'Ver Opciones' },
      });
    } else if (buttons.length > 0) {
      messages.push({
        id: nextId(),
        type: 'buttons',
        sender: 'bot',
        content: { en: content, es: content },
        timestamp: now(),
        status: 'read',
        buttons,
      });
    } else {
      messages.push({
        id: nextId(),
        type: 'text',
        sender: 'bot',
        content: { en: content, es: content },
        timestamp: now(),
        status: 'read',
      });
    }
  }

  // Reset state when going back to welcome
  const resetState = nodeId === 'welcome' ? {
    budgetData: {},
    sendMoneyRecipient: undefined,
    sendMoneyAmount: undefined,
    sendMoneyDelivery: undefined,
    sendMoneyPayment: undefined,
    findWorkLocation: undefined,
    findWorkSkill: undefined,
  } : {};

  return {
    newState: {
      ...state,
      ...resetState,
      currentNode: nodeId,
      messages: [...state.messages, ...messages],
      budgetData: nodeId === 'welcome' ? {} : state.budgetData,
    },
    newMessages: messages,
  };
}
