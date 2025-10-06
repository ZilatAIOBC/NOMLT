import React from 'react';
import { FeatureBar } from './FeatureBar';

export const TopUsedFeatures = () => {
  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-2">Top Used Features</h2>
      <p className="text-gray-400 text-sm mb-6">Feature usage breakdown</p>
      
      <FeatureBar
        name="Text to Image"
        credits="450K credits used"
        percentage={45}
        color="#6366f1"
      />
      <FeatureBar
        name="Image to Video"
        credits="290K credits used"
        percentage={29}
        color="#22c55e"
      />
      <FeatureBar
        name="Image to Image"
        credits="180K credits used"
        percentage={18}
        color="#eab308"
      />
      <FeatureBar
        name="Text to Video"
        credits="90K credits used"
        percentage={9}
        color="#ef4444"
      />
    </div>
  );
};

export default TopUsedFeatures;
