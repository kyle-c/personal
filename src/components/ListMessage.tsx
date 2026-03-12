import React, { useState } from 'react';
import type { Message, ButtonOption } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import MessageStatus from './MessageStatus';

interface Props {
  message: Message;
  onAction: (actionId: string) => void;
  disabled?: boolean;
}

export default function ListMessage({ message, onAction, disabled }: Props) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const content = t(message.content);
  const items = message.buttons || [];
  const buttonText = message.listButtonText ? t(message.listButtonText) : 'Menu';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSelect = (id: string) => {
    setIsOpen(false);
    if (!disabled) onAction(id);
  };

  return (
    <div className="flex justify-start px-3 mb-1">
      <div className="max-w-[85%]">
        <div className="wa-bubble-in px-3 py-2">
          <div className="text-sm whitespace-pre-wrap leading-relaxed text-gray-800">
            {content}
          </div>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <span className="text-[10px] text-gray-500">{formatTime(message.timestamp)}</span>
          </div>
        </div>

        {/* List button */}
        <button
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          className={`
            w-full mt-1 py-2.5 rounded-lg text-sm font-medium
            border border-wa-teal text-wa-teal bg-white
            flex items-center justify-center gap-2
            transition-all duration-150
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 active:scale-[0.98] cursor-pointer'}
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {buttonText}
        </button>

        {/* Full-screen modal overlay */}
        {isOpen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
            {/* Modal header */}
            <div className="bg-wa-header text-white px-4 py-4 flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="font-medium text-base">{buttonText}</span>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                {items.map((item: ButtonOption, index: number) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`
                      w-full px-5 py-4 text-left hover:bg-gray-50 active:bg-gray-100
                      flex items-center gap-3 transition-colors cursor-pointer
                      ${index < items.length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                  >
                    <span className="text-[15px] text-gray-800">{t(item.label)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
