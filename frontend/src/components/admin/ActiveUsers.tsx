import React from 'react';
import { ActiveUser } from './ActiveUser';

export const ActiveUsers = () => {
  return (
    <div 
      className="rounded-lg p-6 border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <h2 className="text-xl font-bold text-white mb-2">Most Active Users</h2>
      <p className="text-gray-400 text-sm mb-6">Top performers this month</p>
      
      <div>
        <ActiveUser
          initials="SJ"
          name="Sarah Johnson"
          email="sarah@example.com"
          credits={1240}
          tier="Pro"
        />
        <ActiveUser
          initials="MC"
          name="Mike Chen"
          email="mike@example.com"
          credits={980}
          tier="Basic"
        />
        <ActiveUser
          initials="ED"
          name="Emma Davis"
          email="emma@example.com"
          credits={856}
          tier="Pro"
        />
        <ActiveUser
          initials="JW"
          name="James Wilson"
          email="james@example.com"
          credits={742}
          tier="Basic"
        />
      </div>
    </div>
  );
};

export default ActiveUsers;
