import React from 'react';
import { Users, CreditCard, Zap, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Users"
        value="12,847"
        change="+12% from last month"
        icon={<Users size={20} />}
      />
      <StatCard
        title="Active Subscriptions"
        value="3,247"
        change="+8% from last month"
        icon={<CreditCard size={20} />}
      />
      <StatCard
        title="Total Credits Used"
        value="1.2M"
        change="+25% from last month"
        icon={<Zap size={20} />}
      />
      <StatCard
        title="Revenue This Month"
        value="$23,456"
        change="+15% from last month"
        icon={<DollarSign size={20} />}
      />
      <StatCard
        title="Active Features"
        value="8/10"
        change="2 disabled"
        icon={<Activity size={20} />}
      />
      <StatCard
        title="Avg Credits/User"
        value="94"
        change="+5% from last month"
        icon={<TrendingUp size={20} />}
      />
    </div>
  );
};

export default StatsGrid;
