import React from 'react';
import TopHeader from '../../components/dashboard/TopHeader';
import HeaderBar from '../../components/dashboard/HeaderBar';
import PurchaseSubscriptions from '../../components/dashboard/PurchaseSubscriptions';
import ComparePlans from '../../components/dashboard/ComparePlans';
import FAQAccordion from '../../components/dashboard/FAQAccordion';

const ManageSubscription: React.FC = () => {
  return (
    <div className="ml-16 lg:ml-64 h-screen overflow-y-auto transition-all duration-300">
      <HeaderBar>
        <TopHeader />
      </HeaderBar>

      <div className="p-8 pt-24">
        <PurchaseSubscriptions />
        <ComparePlans />
        <div className="mt-16 md:mt-24">
          <FAQAccordion />
        </div>
      </div>
    </div>
  );
};

export default ManageSubscription;


