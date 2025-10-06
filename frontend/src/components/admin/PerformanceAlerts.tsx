import React from 'react';

const PerformanceAlerts = () => {
  const alerts = [
    {
      type: 'Revenue Target',
      message: 'Monthly goal achieved',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400'
    },
    {
      type: 'High Usage User',
      message: 'Sarah J. exceeded TK credits',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400'
    },
    {
      type: 'New Feature Popular',
      message: 'Image2Video usage up 40%',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400'
    }
  ];

  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-6">Performance Alerts</h2>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className={`${alert.bgColor} border ${alert.borderColor} rounded-lg p-4`}>
            <div className={`${alert.textColor} text-xs font-medium mb-2`}>{alert.type}</div>
            <div className="text-white text-sm">{alert.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceAlerts;
