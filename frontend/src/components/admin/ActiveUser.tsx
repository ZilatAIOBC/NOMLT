import React from 'react';

interface ActiveUserProps {
  initials: string;
  name: string;
  email: string;
  credits: number;
  tier: string;
}

export const ActiveUser = ({ initials, name, email, credits, tier }: ActiveUserProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-white/10 last:border-b-0 gap-3 sm:gap-0">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0`}
        style={{ 
          border: '2px solid rgba(138, 63, 252, 0.6)',
          color: '#8A3FFC',
          backgroundColor: 'rgba(138, 63, 252, 0.2)'
        }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm font-medium truncate">{name}</div>
        <div className="text-gray-500 text-xs truncate">{email}</div>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row sm:items-end sm:text-right gap-2 sm:gap-3 flex-shrink-0">
      <div className="text-white text-sm font-semibold">{credits.toLocaleString()} credits</div>
      <span 
        className="text-xs px-3 py-1 rounded-full inline-block w-fit"
        style={{ 
          border: '1px solid #8A3FFC',
          color: '#8A3FFC',
          backgroundColor: 'rgba(138, 63, 252, 0.15)'
        }}
      >
        {tier}
      </span>
    </div>
  </div>
);

export default ActiveUser;
