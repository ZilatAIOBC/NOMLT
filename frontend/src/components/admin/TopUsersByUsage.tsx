import React, { useEffect, useState } from 'react';
import TopUser from './TopUser';
import { getTopUsers } from '../../services/analyticsService';

/**
 * Calculate estimated cost in cents based on credit usage
 * Pricing tiers:
 * - Basic: $4.24 (424 cents) for 6000 credits = 0.0706667 cents/credit
 * - Standard: $14.17 (1417 cents) for 10000 credits = 0.1417 cents/credit
 * - Pro: $70.82 (7082 cents) for 20000 credits = 0.3541 cents/credit
 */
const calculateEstimatedCost = (creditsUsed: number): number => {
  // Use tiered pricing based on usage level
  if (creditsUsed <= 6000) {
    // Basic tier rate
    return Math.round(creditsUsed * (424 / 6000));
  } else if (creditsUsed <= 10000) {
    // Standard tier rate
    return Math.round(creditsUsed * (1417 / 10000));
  } else {
    // Pro tier rate
    return Math.round(creditsUsed * (7082 / 20000));
  }
};

/**
 * Format cents to currency string
 */
const formatCurrency = (cents: number): string => {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
};

const TopUsersByUsage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setLoading(true);
        const response = await getTopUsers(5, 'credits'); // Get top 5 users by credits
        
        const formattedUsers = response.top_users.map((user, index) => {
          const estimatedCostCents = calculateEstimatedCost(user.total_credits_spent);
          return {
            rank: index + 1,
            name: user.name || user.email,
            credits: user.total_credits_spent,
            estimatedCost: formatCurrency(estimatedCostCents)
          };
        });
        
        setUsers(formattedUsers);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load top users');
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (loading) {
    return (
      <div 
        className="rounded-lg p-6 border border-white/10"
        style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
      >
        <h2 className="text-xl font-bold text-white mb-2">Top Users by Usage</h2>
        <p className="text-gray-400 text-sm mb-6">Highest credit consumption this month</p>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="rounded-lg p-6 border border-white/10"
        style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
      >
        <h2 className="text-xl font-bold text-white mb-2">Top Users by Usage</h2>
        <p className="text-gray-400 text-sm mb-6">Highest credit consumption this month</p>
        <div className="text-center py-8 text-red-400">
          <p>Failed to load top users</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div 
        className="rounded-lg p-6 border border-white/10"
        style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
      >
        <h2 className="text-xl font-bold text-white mb-2">Top Users by Usage</h2>
        <p className="text-gray-400 text-sm mb-6">Highest credit consumption this month</p>
        <div className="text-center py-8 text-gray-400">
          <p>No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-2">Top Users by Usage</h2>
      <p className="text-gray-400 text-sm mb-6">Highest credit consumption this month</p>
      
      <div>
        {users.map((user, index) => (
          <TopUser
            key={index}
            rank={user.rank}
            name={user.name}
            credits={user.credits}
            estimatedCost={user.estimatedCost}
          />
        ))}
      </div>
    </div>
  );
};

export default TopUsersByUsage;
