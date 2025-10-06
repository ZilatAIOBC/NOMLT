import React from 'react';

const MonthlyTrends = () => {
  const trends = [
    { name: 'Revenue Growth', value: '+18%', color: 'bg-green-600' },
    { name: 'User Growth', value: '+12%', color: 'bg-green-600' },
    { name: 'Usage Growth', value: '+23%', color: 'bg-green-600' },
    { name: 'Churn Rate', value: '2.1%', color: 'bg-orange-500' },
  ];

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-6">Monthly Trends</h2>
      <div className="space-y-3">
        {trends.map((trend, index) => (
          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <span className="text-white text-sm font-medium">{trend.name}</span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white ${trend.color}`}>
              {trend.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyTrends;
