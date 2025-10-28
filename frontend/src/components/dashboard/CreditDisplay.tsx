import React, { useEffect, useState } from 'react';
import { Coins, Loader2, AlertCircle } from 'lucide-react';
import { getCreditBalance } from '../../services/creditsService';

interface CreditDisplayProps {
  onBalanceUpdate?: (balance: number) => void;
  refreshTrigger?: number; // Change this to force refresh
  variant?: 'full' | 'compact';
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  onBalanceUpdate, 
  refreshTrigger = 0,
  variant = 'full' 
}) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCreditBalance();
      setBalance(data.balance);
      onBalanceUpdate?.(data.balance);
    } catch (err: any) {
      // Silently handle auth errors - user might not be logged in yet
      // Removed console for production
      
      // Show 0 balance without error state
      setBalance(0);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 min-w-[100px]">
        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    // Show 0 credits with subtle error indicator instead of alarming red
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 opacity-60">
        <Coins className="w-4 h-4 text-white/40" />
        {variant === 'full' && (
          <>
            <span className="text-sm text-white/40">Credits:</span>
            <span className="text-sm font-semibold text-white/40">--</span>
          </>
        )}
        {variant === 'compact' && (
          <span className="text-sm font-semibold text-white/40">--</span>
        )}
      </div>
    );
  }

  const formatCredits = (amount: number) => {
    return amount.toLocaleString();
  };

  const getBalanceColor = () => {
    if (balance === null) return 'text-white/80';
    if (balance < 100) return 'text-red-400';
    if (balance < 500) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
      <Coins className={`w-4 h-4 ${getBalanceColor()} group-hover:scale-110 transition-transform`} />
      {variant === 'full' && (
        <>
          <span className="text-sm text-white/60">Credits:</span>
          <span className={`text-sm font-semibold ${getBalanceColor()}`}>
            {formatCredits(balance || 0)}
          </span>
        </>
      )}
      {variant === 'compact' && (
        <span className={`text-sm font-semibold ${getBalanceColor()}`}>
          {formatCredits(balance || 0)}
        </span>
      )}
    </div>
  );
};

export default CreditDisplay;

