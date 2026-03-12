import React, { useState, useCallback, useEffect } from 'react';
import type { Message } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import {
  createInitialState,
  getWelcomeMessages,
  processAction,
  processTextInput,
  type EngineState,
} from '../engine/ConversationEngine';
import PhoneFrame from '../components/PhoneFrame';
import ChatHeader from '../components/ChatHeader';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';

export default function Simulator() {
  const { language } = useLanguage();
  const [engineState, setEngineState] = useState<EngineState>(createInitialState());
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      const welcomeMsgs = getWelcomeMessages(language);
      const newState = {
        ...createInitialState(),
        messages: welcomeMsgs,
      };
      setEngineState(newState);
      setDisplayMessages(welcomeMsgs);
      setIsTyping(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [language]);

  const addBotMessages = useCallback((msgs: Message[]) => {
    setIsTyping(true);

    // Simulate typing delay
    const delay = Math.min(500 + msgs.reduce((acc, m) => {
      const len = (m.content.en || '').length;
      return acc + len;
    }, 0) * 2, 2000);

    setTimeout(() => {
      setDisplayMessages((prev) => [...prev, ...msgs]);
      setIsTyping(false);
    }, delay);
  }, []);

  const handleAction = useCallback(
    (actionId: string) => {
      if (isTyping) return;

      // Add user's tap as a message
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        type: 'text',
        sender: 'user',
        content: { en: actionId, es: actionId },
        timestamp: new Date(),
        status: 'read',
      };

      // Find the button label to show as user message
      const lastBotMsg = [...displayMessages].reverse().find((m) => m.sender === 'bot');
      if (lastBotMsg?.buttons) {
        const btn = lastBotMsg.buttons.find((b) => b.id === actionId);
        if (btn) {
          userMsg.content = btn.label;
        }
      }

      setDisplayMessages((prev) => [...prev, userMsg]);

      const result = processAction(engineState, actionId, language);
      setEngineState(result.newState);

      if (result.newMessages.length > 0) {
        addBotMessages(result.newMessages);
      }
    },
    [engineState, language, isTyping, displayMessages, addBotMessages]
  );

  const handleTextInput = useCallback(
    (text: string) => {
      if (isTyping) return;

      // Add user message
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        type: 'text',
        sender: 'user',
        content: { en: text, es: text },
        timestamp: new Date(),
        status: 'read',
      };
      setDisplayMessages((prev) => [...prev, userMsg]);

      const result = processTextInput(engineState, text, language);
      setEngineState(result.newState);

      if (result.newMessages.length > 0) {
        addBotMessages(result.newMessages);
      }
    },
    [engineState, language, isTyping, addBotMessages]
  );

  const expectsInput = engineState.currentNode
    ? ['welcome', 'budget-start', 'budget-income', 'budget-rent', 'budget-food', 'budget-transport'].includes(
        engineState.currentNode
      )
    : false;

  return (
    <PhoneFrame>
      <ChatHeader />
      <ChatWindow
        messages={displayMessages}
        isTyping={isTyping}
        onAction={handleAction}
        interactionDisabled={isTyping}
      />
      <MessageInput
        onSend={handleTextInput}
        disabled={isTyping || !expectsInput}
      />
    </PhoneFrame>
  );
}
