
import { Users, Zap, DollarSign, Filter, Calendar, Download, BarChart3 } from 'lucide-react';
import UsageTimelineChart from '../../components/admin/UsageTimelineChart';
import StatCard from '../../components/admin/StatCard';
import CreditsBurnedByFeature from '../../components/admin/CreditsBurnedByFeature';
import TopUsersByUsage from '../../components/admin/TopUsersByUsage';
import CostPerFeature from '../../components/admin/CostPerFeature';
import MonthlyTrends from '../../components/admin/MonthlyTrends';
import PerformanceAlerts from '../../components/admin/PerformanceAlerts';


export default function Analytics() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Usage & Cost Analytics</h1>
          <p className="text-gray-400">Monitor platform usage and financial metrics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
          </button>
          <button 
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-2"
          >
            <Calendar size={16} />
            Last 30 Days
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
            style={{ backgroundColor: '#8A3FFC' }}
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Credits Burned"
          value="1.2M"
          change="+23% from last month"
          icon={<Zap size={20} />}
        />
        <StatCard
          title="Platform Revenue"
          value="$58,420"
          change="+18% from last month"
          icon={<DollarSign size={20} />}
        />
        <StatCard
          title="Active Users"
          value="3,247"
          change="+12% from last month"
          icon={<Users size={20} />}
        />
        <StatCard
          title="Avg Usage/User"
          value="374"
          change="+8% from last month"
          icon={<BarChart3 size={20} />}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CostPerFeature />
        <MonthlyTrends />
        <PerformanceAlerts />
      </div>
    </div>
  );
}

