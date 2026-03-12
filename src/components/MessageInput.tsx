import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const { language } = useLanguage();
  const placeholder = language === 'es' ? 'Escribe un mensaje...' : 'Type a message...';

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-wa-input-bg px-2 py-2 flex items-center gap-2 shrink-0">
      {/* Emoji button */}
      <button className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Text input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          flex-1 px-4 py-2.5 rounded-full bg-white text-sm
          border-none outline-none placeholder-gray-400
          ${disabled ? 'opacity-50' : ''}
        `}
      />

      {/* Attach / Send button */}
      {text.trim() ? (
        <button
          onClick={handleSend}
          disabled={disabled}
          className="p-2 bg-wa-teal text-white rounded-full hover:bg-wa-dark transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      ) : (
        <button className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}
    </div>
  );
}
