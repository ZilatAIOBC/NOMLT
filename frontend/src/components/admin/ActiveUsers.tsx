import React, { useState, useEffect } from 'react';
import { ActiveUser } from './ActiveUser';
import { getTopUsers, TopUser } from '../../services/analyticsService';

export const ActiveUsers = () => {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopUsers(4, 'credits'); // Get top 4 users by credits spent
      setTopUsers(data.top_users);
    } catch (err) {
      setError('Failed to load top users');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      className="rounded-lg p-4 sm:p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Most Active Users</h2>
      <p className="text-gray-400 text-sm mb-4 sm:mb-6">Top performers by credits spent</p>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-white/10 gap-3 sm:gap-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0"></div>
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:text-right gap-2 sm:gap-3 flex-shrink-0">
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-white/10 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm py-4 text-center">{error}</div>
      ) : topUsers.length === 0 ? (
        <div className="text-gray-400 text-sm py-4 text-center">No active users yet</div>
      ) : (
        <div>
          {topUsers.map((user) => (
            <ActiveUser
              key={user.user_id}
              initials={getInitials(user.name)}
              name={user.name}
              email={user.email}
              credits={user.total_credits_spent}
              tier={user.plan_name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveUsers;
