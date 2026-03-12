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

/** Get the i18n string map for a given node and language */
function getNodeContent(nodeId: string, lang: Language): string {
  const s = strings[lang];

  const contentMap: Record<string, string> = {
    welcome: s.welcome.greeting,
    'financial-menu': s.financial.title,
    'budget-start': s.budget.intro,
    'budget-income': s.budget.gotIncome,
    'budget-rent': s.budget.gotRent,
    'budget-food': s.budget.gotFood,
    'budget-transport': s.budget.gotTransport,
    'savings-tips': s.budget.savingsTipsContent,
    'itin-guide': s.itin.content,
    'credit-guide': s.credit.content,
    'remittances-guide': s.remittances.content,
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
  const s = strings[lang];
  const buttonMap: Record<string, ButtonOption[]> = {
    welcome: [
      { id: 'financial', label: { en: en.welcome.financial, es: es.welcome.financial } },
      { id: 'legal', label: { en: en.welcome.legal, es: es.welcome.legal } },
      { id: 'community', label: { en: en.welcome.community, es: es.welcome.community } },
      { id: 'emergency', label: { en: en.welcome.emergencyBtn, es: es.welcome.emergencyBtn } },
    ],
    'itin-guide': [
      { id: 'back', label: { en: en.itin.back, es: es.itin.back } },
    ],
    'credit-guide': [
      { id: 'back', label: { en: en.credit.back, es: es.credit.back } },
    ],
    'remittances-guide': [
      { id: 'back', label: { en: en.remittances.back, es: es.remittances.back } },
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
    ],
    'education-resources': [
      { id: 'back', label: { en: en.communityResources.back, es: es.communityResources.back } },
    ],
    'housing-resources': [
      { id: 'back', label: { en: en.communityResources.back, es: es.communityResources.back } },
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

  const nextNodeId = node.transitions[actionId];
  if (!nextNodeId) return { newState: state, newMessages: [] };

  return navigateToNode(state, nextNodeId, lang);
}

export function processTextInput(
  state: EngineState,
  text: string,
  lang: Language
): { newState: EngineState; newMessages: Message[] } {
  const node = flowNodes[state.currentNode];
  if (!node || !node.expectsInput || !node.inputHandler) {
    return { newState: state, newMessages: [] };
  }

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

  // Map input handler to budget field
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
    // Final step — show summary
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

  // Handle special nodes with second messages (emergency, legal-directory, community-events)
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
    const isListNode = ['financial-menu', 'legal-menu', 'community-menu', 'document-checklists', 'resource-finder'].includes(nodeId);
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

  // Reset budget data when going back to welcome
  const budgetData = nodeId === 'welcome' ? {} : state.budgetData;

  return {
    newState: {
      ...state,
      currentNode: nodeId,
      messages: [...state.messages, ...messages],
      budgetData,
    },
    newMessages: messages,
  };
}
