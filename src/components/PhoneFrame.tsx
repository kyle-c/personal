import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: Props) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-wa-dark via-wa-teal to-brand-primary p-4">
      {/* Phone shell */}
      <div className="w-full max-w-[420px] h-[90vh] max-h-[850px] bg-black rounded-[2.5rem] p-2 shadow-2xl relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-b-2xl z-10" />

        {/* Screen */}
        <div className="w-full h-full bg-wa-chat-bg rounded-[2rem] overflow-hidden flex flex-col relative">
          {/* Status bar */}
          <div className="bg-wa-header text-white text-[10px] px-6 pt-2 pb-0 flex justify-between items-center shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
              </svg>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
              </svg>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
