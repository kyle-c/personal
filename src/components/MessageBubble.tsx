import React from 'react';
import type { Message } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import MessageStatus from './MessageStatus';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const { t } = useLanguage();
  const isBot = message.sender === 'bot';
  const content = t(message.content);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} px-3 mb-1`}>
      <div
        className={`max-w-[85%] px-3 py-2 ${
          isBot ? 'wa-bubble-in' : 'wa-bubble-out'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap leading-relaxed text-gray-800">
          {content}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isBot ? 'justify-end' : 'justify-end'}`}>
          <span className="text-[10px] text-gray-500">{formatTime(message.timestamp)}</span>
          {!isBot && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}
