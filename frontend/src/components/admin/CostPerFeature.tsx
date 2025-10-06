import React from 'react';

const CostPerFeature = () => {
  const features = [
    { name: 'Text to Image', cost: '$900,000' },
    { name: 'Image to Video', cost: '$2,800,000' },
    { name: 'Image to Image', cost: '$540,000' },
    { name: 'Text to Video', cost: '$1,350,000' },
  ];

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-6">Cost per Feature</h2>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <span className="text-white text-sm font-medium">{feature.name}</span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#8A3FFC4D' }}>
              {feature.cost}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostPerFeature;
