import React from 'react';
import TopHeader from '../../components/dashboard/TopHeader';
import HeaderBar from '../../components/dashboard/HeaderBar';
import ExploreGrid from '../../components/dashboard/ExploreGrid';
import RetentionReminder from '../../components/common/RetentionReminder';

const ViewGenerations: React.FC = () => {
  return (
    <div className="ml-16 lg:ml-64 h-screen overflow-y-auto transition-all duration-300">
      <HeaderBar>
        <TopHeader />
      </HeaderBar>

      <div className="p-8 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">View Generations</h1>
          <p className="text-gray-400">Browse and explore all your AI-generated content</p>
        </div>
        {/* Retention warning banner */}
        <RetentionReminder className="mb-6" />
        
        {/* Explore Grid Component (with tabs header but without title) */}
        <ExploreGrid showHeader={true} showTitle={false} />
      </div>
    </div>
  );
};

export default ViewGenerations;
