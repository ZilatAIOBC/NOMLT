import { useEffect, useState } from 'react';
import { getMonthlyTrends, MonthlyTrends as MonthlyTrendsType } from '../../services/analyticsService';

const MonthlyTrends = () => {
  const [trendsData, setTrendsData] = useState<MonthlyTrendsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthlyTrends();
  }, []);

  const fetchMonthlyTrends = async () => {
    try {
      setLoading(true);
      const data = await getMonthlyTrends();
      setTrendsData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching monthly trends:', err);
      setError('Failed to load trends');
    } finally {
      setLoading(false);
    }
  };

  const formatGrowth = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getColor = (value: number): string => {
    if (value > 0) return 'bg-green-600';
    if (value < 0) return 'bg-red-600';
    return 'bg-gray-600';
  };

  const trends = trendsData ? [
    { 
      name: 'Revenue Growth', 
      value: formatGrowth(trendsData.revenue_growth), 
      color: getColor(trendsData.revenue_growth) 
    },
    { 
      name: 'User Growth', 
      value: formatGrowth(trendsData.user_growth), 
      color: getColor(trendsData.user_growth) 
    },
    { 
      name: 'Usage Growth', 
      value: formatGrowth(trendsData.usage_growth), 
      color: getColor(trendsData.usage_growth) 
    },
  ] : [];

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-6">Monthly Trends</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 animate-pulse">
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
              <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm text-center py-4">{error}</div>
      ) : (
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
      )}
    </div>
  );
};

export default MonthlyTrends;
