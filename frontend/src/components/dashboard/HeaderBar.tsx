import React from 'react';

type HeaderBarProps = {
  children: React.ReactNode;
};

const HeaderBar: React.FC<HeaderBarProps> = ({ children }) => {
  return (
    <div className="fixed top-0 right-2 md:right-4 left-16 lg:left-64 z-20 bg-[#0F0F0F]">
      <div className="px-4 pt-4">
        {/* Full width on mobile; constrained and right-aligned on md+ */}
        <div className="w-full max-w-6xl md:ml-auto md:mr-0">
          <div className="flex w-full justify-between md:justify-end md:ml-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;


