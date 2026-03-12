import type { EmergencyContact } from '../types';

export const emergencyContacts: EmergencyContact[] = [
  {
    id: 'national-hotline',
    name: { en: 'National Immigrant Legal Hotline', es: 'Línea Nacional Legal para Inmigrantes' },
    phone: '1-800-354-0365',
    description: { en: 'Free legal help and referrals', es: 'Ayuda legal gratuita y referencias' },
    available24h: true,
  },
  {
    id: 'ice-reporting',
    name: { en: 'ICE Reporting Line', es: 'Línea de Reporte de ICE' },
    phone: '1-844-864-8341',
    description: { en: 'Report ICE activity in your area', es: 'Reporta actividad de ICE en tu área' },
    available24h: true,
  },
  {
    id: 'raices',
    name: { en: 'RAICES Legal Aid', es: 'RAICES Ayuda Legal' },
    phone: '(210) 222-0157',
    description: { en: 'Free legal services for immigrants in Texas', es: 'Servicios legales gratuitos para inmigrantes en Texas' },
    available24h: false,
  },
  {
    id: 'united-we-dream',
    name: { en: 'United We Dream Hotline', es: 'Línea United We Dream' },
    phone: '1-844-363-1423',
    description: { en: 'Support for undocumented youth', es: 'Apoyo para jóvenes indocumentados' },
    available24h: true,
  },
  {
    id: 'domestic-violence',
    name: { en: 'National DV Hotline (Spanish)', es: 'Línea Nacional de Violencia Doméstica' },
    phone: '1-800-799-7233',
    description: { en: 'Bilingual support for domestic violence', es: 'Apoyo bilingüe para violencia doméstica' },
    available24h: true,
  },
  {
    id: 'crisis-text',
    name: { en: 'Crisis Text Line', es: 'Línea de Crisis por Texto' },
    phone: 'Text HOME to 741741',
    description: { en: 'Text-based crisis support', es: 'Apoyo de crisis por mensaje de texto' },
    available24h: true,
  },
];
