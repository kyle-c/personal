import React from 'react';
import type { ButtonOption } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  buttons: ButtonOption[];
  onAction: (actionId: string) => void;
  disabled?: boolean;
}

export default function InteractiveButtons({ buttons, onAction, disabled }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2 px-3 mb-2">
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => !disabled && onAction(button.id)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-full text-sm font-medium
            border border-wa-teal text-wa-teal bg-white
            transition-all duration-150
            ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-wa-teal hover:text-white active:scale-95 cursor-pointer'
            }
          `}
        >
          {t(button.label)}
        </button>
      ))}
    </div>
  );
}
