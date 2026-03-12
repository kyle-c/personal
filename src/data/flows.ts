import type { FlowNode } from '../types';

/**
 * All conversation flow nodes. Each node has messages to display
 * and transitions mapping action IDs to next node IDs.
 */
export const flowNodes: Record<string, FlowNode> = {
  // ── WELCOME ──
  welcome: {
    id: 'welcome',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n welcome.greeting
      },
    ],
    transitions: {
      sendMoney: 'remittances-guide',
      findWork: 'community-events',
      knowRights: 'know-your-rights',
    },
  },

  // ── ALL SERVICES ──
  'all-services': {
    id: 'all-services',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n allServices.title
      },
    ],
    transitions: {
      sendMoney: 'remittances-guide',
      findWork: 'community-events',
      knowRights: 'know-your-rights',
      budgetCalc: 'budget-start',
      getITIN: 'itin-guide',
      buildCredit: 'credit-guide',
      openBank: 'bank-account-guide',
      findHealthcare: 'health-resources',
      findHousing: 'housing-resources',
      getEducation: 'education-resources',
      legalHelp: 'legal-menu',
      events: 'community-events',
      backToMenu: 'welcome',
    },
  },

  // ── FINANCIAL ──
  'financial-menu': {
    id: 'financial-menu',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n financial.title
      },
    ],
    transitions: {
      budget: 'budget-start',
      itin: 'itin-guide',
      credit: 'credit-guide',
      remittances: 'remittances-guide',
      bankAccount: 'bank-account-guide',
      backToMenu: 'welcome',
    },
  },

  'budget-start': {
    id: 'budget-start',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n budget.intro
      },
    ],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-income',
  },

  'budget-income': {
    id: 'budget-income',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n budget.gotIncome
      },
    ],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-rent',
  },

  'budget-rent': {
    id: 'budget-rent',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n budget.gotRent
      },
    ],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-food',
  },

  'budget-food': {
    id: 'budget-food',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n budget.gotFood
      },
    ],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-transport',
  },

  'budget-transport': {
    id: 'budget-transport',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n budget.gotTransport
      },
    ],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-other',
  },

  'budget-other': {
    id: 'budget-other',
    messages: [
      {
        type: 'budget-summary',
        sender: 'bot',
        content: { en: '', es: '' }, // dynamically generated
      },
    ],
    transitions: {
      savingsTips: 'savings-tips',
      sendRemittance: 'remittances-guide',
      backToMenu: 'welcome',
    },
  },

  'savings-tips': {
    id: 'savings-tips',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n budget.savingsTipsContent
      },
    ],
    transitions: {
      backToMenu: 'welcome',
      back: 'financial-menu',
    },
  },

  'itin-guide': {
    id: 'itin-guide',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n itin.content
      },
    ],
    transitions: {
      back: 'financial-menu',
      backToMenu: 'welcome',
    },
  },

  'credit-guide': {
    id: 'credit-guide',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n credit.content
      },
    ],
    transitions: {
      back: 'financial-menu',
      backToMenu: 'welcome',
    },
  },

  'remittances-guide': {
    id: 'remittances-guide',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n remittances.content
      },
    ],
    transitions: {
      back: 'financial-menu',
      backToMenu: 'welcome',
    },
  },

  'bank-account-guide': {
    id: 'bank-account-guide',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n bankAccount.content
      },
    ],
    transitions: {
      back: 'financial-menu',
      backToMenu: 'welcome',
    },
  },

  // ── LEGAL ──
  'legal-menu': {
    id: 'legal-menu',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n legal.title
      },
    ],
    transitions: {
      rights: 'know-your-rights',
      visas: 'visa-pathways',
      documents: 'document-checklists',
      directory: 'legal-directory',
      emergencyContacts: 'emergency',
      backToMenu: 'welcome',
    },
  },

  'know-your-rights': {
    id: 'know-your-rights',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n rights.iceAtDoor
      },
    ],
    transitions: {
      workplaceRights: 'workplace-rights',
      callLegal: 'legal-directory',
      back: 'legal-menu',
    },
  },

  'workplace-rights': {
    id: 'workplace-rights',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n rights.workplace
      },
    ],
    transitions: {
      callLegal: 'legal-directory',
      back: 'know-your-rights',
    },
  },

  'visa-pathways': {
    id: 'visa-pathways',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n visas.content
      },
    ],
    transitions: {
      findLawyer: 'legal-directory',
      back: 'legal-menu',
    },
  },

  'document-checklists': {
    id: 'document-checklists',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: {
          en: '📝 Document Checklists\nSelect the checklist you need:',
          es: '📝 Listas de Documentos\nSelecciona la lista que necesitas:',
        },
      },
    ],
    transitions: {
      daca: 'daca-checklist',
      tps: 'tps-checklist',
      back: 'legal-menu',
    },
  },

  'daca-checklist': {
    id: 'daca-checklist',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n documents.dacaTitle
      },
    ],
    transitions: {
      back: 'document-checklists',
      findLawyer: 'legal-directory',
    },
  },

  'tps-checklist': {
    id: 'tps-checklist',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n documents.tpsTitle
      },
    ],
    transitions: {
      back: 'document-checklists',
      findLawyer: 'legal-directory',
    },
  },

  'legal-directory': {
    id: 'legal-directory',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n legalDirectory.title
      },
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n legalDirectory.orgs
      },
    ],
    transitions: {
      back: 'legal-menu',
      backToMenu: 'welcome',
    },
  },

  // ── COMMUNITY ──
  'community-menu': {
    id: 'community-menu',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n community.title
      },
    ],
    transitions: {
      search: 'resource-finder',
      health: 'health-resources',
      education: 'education-resources',
      housing: 'housing-resources',
      events: 'community-events',
      backToMenu: 'welcome',
    },
  },

  'resource-finder': {
    id: 'resource-finder',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: {
          en: '🔍 What type of resource are you looking for?',
          es: '🔍 ¿Qué tipo de recurso buscas?',
        },
      },
    ],
    transitions: {
      health: 'health-resources',
      education: 'education-resources',
      housing: 'housing-resources',
      back: 'community-menu',
    },
  },

  'health-resources': {
    id: 'health-resources',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n communityResources.health
      },
    ],
    transitions: {
      back: 'community-menu',
      backToMenu: 'welcome',
    },
  },

  'education-resources': {
    id: 'education-resources',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n communityResources.education
      },
    ],
    transitions: {
      back: 'community-menu',
      backToMenu: 'welcome',
    },
  },

  'housing-resources': {
    id: 'housing-resources',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n communityResources.housing
      },
    ],
    transitions: {
      back: 'community-menu',
      backToMenu: 'welcome',
    },
  },

  'community-events': {
    id: 'community-events',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n events.title
      },
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n events.eventList
      },
    ],
    transitions: {
      back: 'community-menu',
      backToMenu: 'welcome',
    },
  },

  // ── EMERGENCY ──
  emergency: {
    id: 'emergency',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n emergencyFlow.title
      },
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' }, // uses i18n emergencyFlow.hotlines
      },
    ],
    transitions: {
      rightsBtn: 'know-your-rights',
      backToMenu: 'welcome',
    },
  },
};
