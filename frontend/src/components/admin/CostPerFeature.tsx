import React, { useEffect, useState } from 'react';
import { getCostPerFeature, CostPerFeature as CostPerFeatureType } from '../../services/analyticsService';

// Format number with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Format dollar amount
const formatDollars = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`;
  } else if (amount >= 1) {
    return `$${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(4)}`;
};

const CostPerFeature = () => {
  const [features, setFeatures] = useState<CostPerFeatureType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCostPerFeature = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCostPerFeature();
        setFeatures(data.features);
      } catch (err) {
        setError('Failed to load cost per feature data');
      } finally {
        setLoading(false);
      }
    };

    fetchCostPerFeature();
  }, []);

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-2">Cost per Feature</h2>
      <p className="text-gray-400 text-sm mb-6">Total cost in USD (Usage × AI Model Price)</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
              <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : features.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No cost data available</div>
      ) : (
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <span className="text-white text-sm font-medium">{feature.name}</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#8A3FFC4D' }}>
                {formatDollars(feature.total_cost_usd)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CostPerFeature;
