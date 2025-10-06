import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
}

export const StatCard = ({ title, value, change, icon }: StatCardProps) => (
  <div 
    className="rounded-lg p-6 border border-white/10"
    style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="text-white text-sm">{title}</div>
      <div 
        className="p-2 rounded-lg flex items-center justify-center" 
        style={{ borderColor: '#8A3FFC', borderWidth: '1px', color: '#8A3FFC' }}
      >
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-2">{value}</div>
    <div className="text-sm" style={{ color: '#8A3FFC' }}>
      {change}
    </div>
  </div>
);

export default StatCard;