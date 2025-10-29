import React, { useEffect, useState } from 'react';
import { FeatureBar } from './FeatureBar';
import { getFeatureUsageStats, FeatureUsageData } from '../../services/analyticsService';

// Feature display names and colors
const FEATURE_CONFIG: Record<string, { displayName: string; color: string }> = {
  'text-to-image': { displayName: 'Text to Image', color: '#6366f1' },
  'image-to-video': { displayName: 'Image to Video', color: '#22c55e' },
  'image-to-image': { displayName: 'Image to Image', color: '#eab308' },
  'text-to-video': { displayName: 'Text to Video', color: '#ef4444' }
};

// Format credits for display
const formatCredits = (credits: number): string => {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M credits used`;
  } else if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K credits used`;
  }
  return `${credits} credits used`;
};

export const TopUsedFeatures = () => {
  const [features, setFeatures] = useState<FeatureUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatureUsage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFeatureUsageStats();
        setFeatures(data.features);
      } catch (err) {
        setError('Failed to load feature usage data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureUsage();
  }, []);

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-2">Top Used Features</h2>
      <p className="text-gray-400 text-sm mb-6">Feature usage breakdown</p>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="h-4 w-48 bg-white/10 rounded animate-pulse"></div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-white/10 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : features.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No feature usage data available</div>
      ) : (
        features.map((feature) => {
          const config = FEATURE_CONFIG[feature.name] || { 
            displayName: feature.name, 
            color: '#8A3FFC' 
          };
          
          return (
            <FeatureBar
              key={feature.name}
              name={config.displayName}
              credits={formatCredits(feature.credits)}
              percentage={parseFloat(feature.percentage)}
              color={config.color}
            />
          );
        })
      )}
    </div>
  );
};

export default TopUsedFeatures;
