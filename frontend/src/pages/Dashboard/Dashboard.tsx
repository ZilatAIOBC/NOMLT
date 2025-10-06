import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import ImageToVideo from './ImageToVideo';
import TextToImage from './TextToImage';
import ImageToImage from './ImageToImage';
import TextToVideo from './TextToVideo';
import Settings from './Settings';
import ViewGenerations from './ViewGenerations';
import ManageSubscription from './ManageSubscription';
import Billing from './Billing';
import Credits from './Credits';
import SearchHero from '../../components/dashboard/SearchHero';
import GenerationTools from '../../components/dashboard/GenerationTools';
import TopHeader from '../../components/dashboard/TopHeader';
import HeaderBar from '../../components/dashboard/HeaderBar';
import ExploreGrid from '../../components/dashboard/ExploreGrid';

const Dashboard: React.FC = () => {

  return (
    <div className="min-h-screen bg-[#0F0F0F] overflow-y-auto">
      <Sidebar />
      
      <Routes>
        <Route path="/" element={
          <div className="ml-16 lg:ml-64 transition-all duration-300">
            {/* Fixed Header (stays on top during scroll) */}
            <HeaderBar>
              <TopHeader />
            </HeaderBar>
            <div className="p-8 pt-24">
              {/* Search Card */}
              <SearchHero />

              {/* Video generation tools */}
              <GenerationTools />

              {/* Explore Grid */}
              <ExploreGrid />
            </div>
          </div>
        } />
        <Route path="/text-to-image" element={<TextToImage />} />
        <Route path="/image-to-image" element={<ImageToImage />} />
        <Route path="/text-to-video" element={<TextToVideo />} />
        <Route path="/image-to-video" element={<ImageToVideo />} />
        <Route path="/view-generations" element={<ViewGenerations />} />
        <Route path="/subscription" element={<ManageSubscription />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/settings" element={<Settings />} />
        {/* Help route removed */}
      </Routes>
    </div>
  );
};

export default Dashboard;