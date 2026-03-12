import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import InteractiveButtons from './InteractiveButtons';
import ListMessage from './ListMessage';
import TypingIndicator from './TypingIndicator';

interface Props {
  messages: Message[];
  isTyping: boolean;
  onAction: (actionId: string) => void;
  interactionDisabled: boolean;
}

export default function ChatWindow({ messages, isTyping, onAction, interactionDisabled }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Date separator
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-thin py-2"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c8c8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Date separator */}
      <div className="flex justify-center py-2 mb-2">
        <span className="bg-white/90 text-gray-500 text-xs px-3 py-1 rounded-lg shadow-sm">
          {today}
        </span>
      </div>

      {/* Messages */}
      {messages.map((message, index) => {
        const isLastBotMessage =
          message.sender === 'bot' &&
          (index === messages.length - 1 ||
            messages.slice(index + 1).every((m) => m.sender === 'user'));

        if (message.type === 'list') {
          return (
            <React.Fragment key={message.id}>
              <ListMessage
                message={message}
                onAction={onAction}
                disabled={interactionDisabled || !isLastBotMessage}
              />
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={message.id}>
            <MessageBubble message={message} />
            {message.buttons && message.buttons.length > 0 && (
              <InteractiveButtons
                buttons={message.buttons}
                onAction={onAction}
                disabled={interactionDisabled || !isLastBotMessage}
              />
            )}
          </React.Fragment>
        );
      })}

      {isTyping && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
