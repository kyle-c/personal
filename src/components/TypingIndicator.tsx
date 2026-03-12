import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-1 px-4 py-2">
      <div className="wa-bubble-in px-4 py-3 flex items-center gap-1">
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
      </div>
    </div>
  );
}
