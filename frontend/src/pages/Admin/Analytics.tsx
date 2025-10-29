import { useEffect, useState } from 'react';
import { Users, Zap, DollarSign, BarChart3 } from 'lucide-react';
import UsageTimelineChart from '../../components/admin/UsageTimelineChart';
import StatCard from '../../components/admin/StatCard';
import CreditsBurnedByFeature from '../../components/admin/CreditsBurnedByFeature';
import TopUsersByUsage from '../../components/admin/TopUsersByUsage';
import CostPerFeature from '../../components/admin/CostPerFeature';
import MonthlyTrends from '../../components/admin/MonthlyTrends';
import { getDashboardStats, DashboardStats } from '../../services/analyticsService';


export default function Analytics() {
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
      setError('Failed to load statistics');
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const avgCreditsPerUser = stats && stats.total_users > 0 
    ? Math.round(stats.total_credits_used / stats.total_users)
    : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Usage & Cost Analytics</h1>
        <p className="text-gray-400">Monitor platform usage and financial metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Credits Burned"
          value={stats ? formatNumber(stats.total_credits_used) : "0"}
          change={error ? error : "All-time credit usage"}
          icon={<Zap size={20} />}
          loading={loading}
        />
        <StatCard
          title="Platform Revenue"
          value={stats ? formatCurrency(stats.total_revenue) : "$0"}
          change={error ? error : "All-time revenue"}
          icon={<DollarSign size={20} />}
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={stats ? formatNumber(stats.total_users) : "0"}
          change={error ? error : "All registered users"}
          icon={<Users size={20} />}
          loading={loading}
        />
        <StatCard
          title="Avg Usage/User"
          value={stats ? formatNumber(avgCreditsPerUser) : "0"}
          change={error ? error : "Average credits per user"}
          icon={<BarChart3 size={20} />}
          loading={loading}
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CreditsBurnedByFeature />
        <TopUsersByUsage />
      </div>

      {/* Usage Timeline */}
      <div 
        className="rounded-lg p-6 border border-white/10 mb-8"
        style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
      >
        <h2 className="text-xl font-bold text-white mb-2">Usage Timeline</h2>
        <p className="text-gray-400 text-sm mb-6">Credit usage over the past 30 days</p>
        <div className="w-full border-t border-white/10 my-4"></div>
        <div className="h-80 w-full relative">
          <UsageTimelineChart className="h-full" />
        </div>
      </div>

      {/* Bottom Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CostPerFeature />
        <MonthlyTrends />
      </div>
    </div>
  );
}

