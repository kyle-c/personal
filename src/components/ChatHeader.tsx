import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function ChatHeader() {
  const { language, toggleLanguage, t } = useLanguage();
  const s = language === 'es'
    ? { title: 'FelixClaw', subtitle: 'en línea', switchLabel: 'EN' }
    : { title: 'FelixClaw', subtitle: 'online', switchLabel: 'ES' };

  return (
    <div className="bg-wa-header text-white px-3 py-2 flex items-center gap-3 shrink-0">
      {/* Back arrow */}
      <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-wa-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
        FC
      </div>

      {/* Name and status */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base leading-tight">{s.title}</div>
        <div className="text-xs text-green-200">{s.subtitle}</div>
      </div>

      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        className="px-2 py-1 text-xs font-bold bg-white/20 rounded hover:bg-white/30 transition-colors cursor-pointer"
      >
        {s.switchLabel}
      </button>

      {/* Icons */}
      <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    </div>
  );
}
