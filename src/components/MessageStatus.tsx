import React from 'react';
import type { MessageStatus as Status } from '../types';

interface Props {
  status: Status;
}

export default function MessageStatus({ status }: Props) {
  if (status === 'sending') {
    return <span className="text-gray-400 text-[10px]">🕐</span>;
  }

  if (status === 'sent') {
    return (
      <svg className="w-4 h-3 text-gray-400 inline-block" viewBox="0 0 16 12" fill="none">
        <path d="M1 6l4 4L14 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const color = status === 'read' ? 'text-blue-500' : 'text-gray-400';

  return (
    <svg className={`w-5 h-3 ${color} inline-block`} viewBox="0 0 20 12" fill="none">
      <path d="M1 6l4 4L14 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6l4 4L19 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
