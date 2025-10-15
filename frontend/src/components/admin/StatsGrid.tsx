import { useEffect, useState } from 'react';
import { Users, CreditCard, Zap, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { getDashboardStats, DashboardStats } from '../../services/analyticsService';

export const StatsGrid = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const avgCreditsPerUser = stats && stats.total_users > 0 
    ? Math.round(stats.total_credits_used / stats.total_users)
    : 0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Users"
        value={loading ? "Loading..." : stats ? formatNumber(stats.total_users) : "0"}
        change={error ? error : "All registered users"}
        icon={<Users size={20} />}
      />
      <StatCard
        title="Active Subscriptions"
        value={loading ? "Loading..." : stats ? formatNumber(stats.active_subscriptions) : "0"}
        change={error ? error : "Users with active plans"}
        icon={<CreditCard size={20} />}
      />
      <StatCard
        title="Total Credits Used"
        value={loading ? "Loading..." : stats ? formatNumber(stats.total_credits_used) : "0"}
        change={error ? error : "All-time credit usage"}
        icon={<Zap size={20} />}
      />
      <StatCard
        title="Monthly Revenue (MRR)"
        value={loading ? "Loading..." : stats ? formatCurrency(stats.mrr) : "$0"}
        change={error ? error : "Monthly Recurring Revenue"}
        icon={<DollarSign size={20} />}
      />
     
      <StatCard
        title="Active Features"
        value="4/4"
        change="All features enabled"
        icon={<Activity size={20} />}
      />
      <StatCard
        title="Avg Credits/User"
        value={loading ? "Loading..." : stats ? formatNumber(avgCreditsPerUser) : "0"}
        change={error ? error : "Average usage per user"}
        icon={<TrendingUp size={20} />}
      />
    </div>
  );
};

export default StatsGrid;
