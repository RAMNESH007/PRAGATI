import React from 'react';

export const MinistryOfRailwaysEmblem: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
      <img
        src="/images/railway-logo.png"
        alt="Ministry of Railways - Government of India"
        className="w-full h-full object-contain drop-shadow-sm"
      />
    </div>
  );
};

export const IRCTCLogo: React.FC<{ className?: string }> = ({ className = 'h-10' }) => {
  return (
    <div className={`flex items-center justify-center select-none flex-shrink-0 ${className}`}>
      <img
        src="/images/irctc-logo.png"
        alt="IRCTC Logo"
        className="h-full w-auto max-h-12 object-contain drop-shadow-sm"
      />
    </div>
  );
};

export const PragatiIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="16" height="16" x="4" y="3" rx="3" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <path d="m8 19-2 3" />
      <path d="m18 22-2-3" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
};
