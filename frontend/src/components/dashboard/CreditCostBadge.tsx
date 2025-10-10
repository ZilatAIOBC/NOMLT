import React from 'react';
import { Coins } from 'lucide-react';

interface CreditCostBadgeProps {
  cost: number;
  label?: string;
}

const CreditCostBadge: React.FC<CreditCostBadgeProps> = ({ cost, label = 'Cost' }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
      <Coins className="w-4 h-4 text-purple-400" />
      <span className="text-sm text-white/60">{label}:</span>
      <span className="text-sm font-semibold text-purple-400">{cost.toLocaleString()} credits</span>
    </div>
  );
};

export default CreditCostBadge;

