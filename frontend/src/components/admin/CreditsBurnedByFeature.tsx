
import FeatureBar from './FeatureBar';

const CreditsBurnedByFeature = () => {
  const features = [
    { name: 'Text to Image', estimatedCost: '$900,000', credits: '450,000 credits', percentage: 45 },
    { name: 'Image to Video', estimatedCost: '$2,800,000', credits: '280,000 credits', percentage: 28 },
    { name: 'Image to Image', estimatedCost: '$540,000', credits: '180,000 credits', percentage: 18 },
    { name: 'Text to Video', estimatedCost: '$1,350,000', credits: '90,000 credits', percentage: 9 },
  ];

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-2">Credits Burned by Feature</h2>
      <p className="text-gray-400 text-sm mb-6">Total usage across all features</p>
      
      {features.map((feature, index) => (
        <FeatureBar
          key={index}
          name={feature.name}
          estimatedCost={feature.estimatedCost}
          credits={feature.credits}
          percentage={feature.percentage}
        />
      ))}
    </div>
  );
};

export default CreditsBurnedByFeature;
