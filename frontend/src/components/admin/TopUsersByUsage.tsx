import React from 'react';
import TopUser from './TopUser';

const TopUsersByUsage = () => {
  const users = [
    { rank: 1, name: 'Sarah Johnson', credits: 1240, estimatedCost: '$24,800' },
    { rank: 2, name: 'Mike Chen', credits: 980, estimatedCost: '$19,600' },
    { rank: 3, name: 'Emma Davis', credits: 856, estimatedCost: '$17,120' },
    { rank: 4, name: 'James Wilson', credits: 742, estimatedCost: '$14,840' },
    { rank: 5, name: 'Lisa Park', credits: 685, estimatedCost: '$13,700' },
  ];

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-2">Top Users by Usage</h2>
      <p className="text-gray-400 text-sm mb-6">Highest credit consumption this month</p>
      
      <div>
        {users.map((user, index) => (
          <TopUser
            key={index}
            rank={user.rank}
            name={user.name}
            credits={user.credits}
            estimatedCost={user.estimatedCost}
          />
        ))}
      </div>
    </div>
  );
};

export default TopUsersByUsage;
