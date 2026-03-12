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
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      sendMoney: 'send-money-start',
      findWork: 'find-work-start',
      myCommunity: 'my-community',
    },
  },

  // ── ALL SERVICES ──
  'all-services': {
    id: 'all-services',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      sendMoney: 'send-money-start',
      findWork: 'find-work-start',
      myCommunity: 'my-community',
      budgetCalc: 'budget-start',
      getITIN: 'itin-guide',
      buildCredit: 'credit-guide',
      openBank: 'bank-account-guide',
      findHealthcare: 'health-resources',
      findHousing: 'housing-resources',
      getEducation: 'education-resources',
      legalHelp: 'legal-menu',
      backToMenu: 'welcome',
    },
  },

  // ── SEND MONEY FLOW ──
  'send-money-start': {
    id: 'send-money-start',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {},
    expectsInput: true,
    inputHandler: 'send-money-amount',
  },

  'send-money-amount': {
    id: 'send-money-amount',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {},
    expectsInput: true,
    inputHandler: 'send-money-delivery',
  },

  'send-money-delivery': {
    id: 'send-money-delivery',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      cashPickup: 'send-money-pay',
      bankAccount: 'send-money-pay',
      digitalWallet: 'send-money-pay',
      mobileTopUp: 'send-money-pay',
      billPay: 'send-money-pay',
    },
  },

  'send-money-pay': {
    id: 'send-money-pay',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      debitCard: 'send-money-success',
      creditCard: 'send-money-success',
      applePay: 'send-money-success',
      ach: 'send-money-success',
      cash: 'send-money-success',
    },
  },

  'send-money-success': {
    id: 'send-money-success',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      sendAnother: 'send-money-start',
      backToMenu: 'welcome',
    },
  },

  // ── FIND WORK FLOW ──
  'find-work-start': {
    id: 'find-work-start',
    messages: [
      {
        type: 'text',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {},
    expectsInput: true,
    inputHandler: 'find-work-skills',
  },

  'find-work-skills': {
    id: 'find-work-skills',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      construction: 'find-work-results',
      cleaning: 'find-work-results',
      restaurant: 'find-work-results',
      landscaping: 'find-work-results',
      warehouse: 'find-work-results',
      childcare: 'find-work-results',
      driving: 'find-work-results',
      other: 'find-work-results',
    },
  },

  'find-work-results': {
    id: 'find-work-results',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      applyNow: 'find-work-apply',
      moreJobs: 'find-work-start',
      backToMenu: 'welcome',
    },
  },

  'find-work-apply': {
    id: 'find-work-apply',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      back: 'find-work-results',
      backToMenu: 'welcome',
    },
  },

  // ── MY COMMUNITY ──
  'my-community': {
    id: 'my-community',
    messages: [
      {
        type: 'list',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      legalClinic: 'community-legal-clinic',
      taxPrep: 'community-tax-prep',
      eslClasses: 'community-esl',
      healthcare: 'health-resources',
      housing: 'housing-resources',
      jobFairs: 'community-events',
      knowRights: 'know-your-rights',
      backToMenu: 'welcome',
    },
  },

  'community-legal-clinic': {
    id: 'community-legal-clinic',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      back: 'my-community',
      backToMenu: 'welcome',
    },
  },

  'community-tax-prep': {
    id: 'community-tax-prep',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      back: 'my-community',
      backToMenu: 'welcome',
    },
  },

  'community-esl': {
    id: 'community-esl',
    messages: [
      {
        type: 'buttons',
        sender: 'bot',
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      back: 'my-community',
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
        content: { en: '', es: '' },
      },
    ],
    transitions: {
      budget: 'budget-start',
      itin: 'itin-guide',
      credit: 'credit-guide',
      remittances: 'send-money-start',
      bankAccount: 'bank-account-guide',
      backToMenu: 'welcome',
    },
  },

  'budget-start': {
    id: 'budget-start',
    messages: [{ type: 'text', sender: 'bot', content: { en: '', es: '' } }],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-income',
  },

  'budget-income': {
    id: 'budget-income',
    messages: [{ type: 'text', sender: 'bot', content: { en: '', es: '' } }],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-rent',
  },

  'budget-rent': {
    id: 'budget-rent',
    messages: [{ type: 'text', sender: 'bot', content: { en: '', es: '' } }],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-food',
  },

  'budget-food': {
    id: 'budget-food',
    messages: [{ type: 'text', sender: 'bot', content: { en: '', es: '' } }],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-transport',
  },

  'budget-transport': {
    id: 'budget-transport',
    messages: [{ type: 'text', sender: 'bot', content: { en: '', es: '' } }],
    transitions: {},
    expectsInput: true,
    inputHandler: 'budget-other',
  },

  'budget-other': {
    id: 'budget-other',
    messages: [{ type: 'budget-summary', sender: 'bot', content: { en: '', es: '' } }],
    transitions: {
      savingsTips: 'savings-tips',
      sendRemittance: 'send-money-start',
      backToMenu: 'welcome',
    },
  },

  'savings-tips': {
    id: 'savings-tips',
    messages: [{ type: 'text', sender: 'bot', content: { en: '', es: '' } }],
    transitions: {
      backToMenu: 'welcome',
      back: 'financial-menu',
    },
  },

  'itin-guide': {
    id: 'itin-guide',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { back: 'financial-menu', backToMenu: 'welcome' },
  },

  'credit-guide': {
    id: 'credit-guide',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { back: 'financial-menu', backToMenu: 'welcome' },
  },

  'bank-account-guide': {
    id: 'bank-account-guide',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { back: 'financial-menu', backToMenu: 'welcome' },
  },

  // ── LEGAL ──
  'legal-menu': {
    id: 'legal-menu',
    messages: [{ type: 'list', sender: 'bot', content: { en: '', es: '' } }],
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
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: {
      workplaceRights: 'workplace-rights',
      callLegal: 'legal-directory',
      back: 'my-community',
    },
  },

  'workplace-rights': {
    id: 'workplace-rights',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { callLegal: 'legal-directory', back: 'know-your-rights' },
  },

  'visa-pathways': {
    id: 'visa-pathways',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { findLawyer: 'legal-directory', back: 'legal-menu' },
  },

  'document-checklists': {
    id: 'document-checklists',
    messages: [{
      type: 'list',
      sender: 'bot',
      content: {
        en: '📝 Document Checklists\nSelect the checklist you need:',
        es: '📝 Listas de Documentos\nSelecciona la lista que necesitas:',
      },
    }],
    transitions: { daca: 'daca-checklist', tps: 'tps-checklist', back: 'legal-menu' },
  },

  'daca-checklist': {
    id: 'daca-checklist',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { back: 'document-checklists', findLawyer: 'legal-directory' },
  },

  'tps-checklist': {
    id: 'tps-checklist',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { back: 'document-checklists', findLawyer: 'legal-directory' },
  },

  'legal-directory': {
    id: 'legal-directory',
    messages: [
      { type: 'text', sender: 'bot', content: { en: '', es: '' } },
      { type: 'buttons', sender: 'bot', content: { en: '', es: '' } },
    ],
    transitions: { back: 'legal-menu', backToMenu: 'welcome' },
  },

  // ── COMMUNITY RESOURCES ──
  'community-menu': {
    id: 'community-menu',
    messages: [{ type: 'list', sender: 'bot', content: { en: '', es: '' } }],
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
    messages: [{
      type: 'list',
      sender: 'bot',
      content: {
        en: '🔍 What type of resource are you looking for?',
        es: '🔍 ¿Qué tipo de recurso buscas?',
      },
    }],
    transitions: {
      health: 'health-resources',
      education: 'education-resources',
      housing: 'housing-resources',
      back: 'community-menu',
    },
  },

  'health-resources': {
    id: 'health-resources',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { back: 'my-community', backToMenu: 'welcome' },
  },

  'education-resources': {
    id: 'education-resources',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { back: 'my-community', backToMenu: 'welcome' },
  },

  'housing-resources': {
    id: 'housing-resources',
    messages: [{ type: 'buttons', sender: 'bot', content: { en: '', es: '' } }],
    transitions: { back: 'my-community', backToMenu: 'welcome' },
  },

  'community-events': {
    id: 'community-events',
    messages: [
      { type: 'text', sender: 'bot', content: { en: '', es: '' } },
      { type: 'buttons', sender: 'bot', content: { en: '', es: '' } },
    ],
    transitions: { back: 'my-community', backToMenu: 'welcome' },
  },

  // ── EMERGENCY ──
  emergency: {
    id: 'emergency',
    messages: [
      { type: 'text', sender: 'bot', content: { en: '', es: '' } },
      { type: 'buttons', sender: 'bot', content: { en: '', es: '' } },
    ],
    transitions: { rightsBtn: 'know-your-rights', backToMenu: 'welcome' },
  },
};
