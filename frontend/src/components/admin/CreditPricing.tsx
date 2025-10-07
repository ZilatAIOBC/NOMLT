import React from 'react';

export default function CreditPricing() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Credit Pricing per Feature</h2>
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#8A3FFC] bg-black/20">
            <div>
              <h3 className="text-white font-medium">Text2Image</h3>
              <p className="text-gray-400 text-sm">Cost per generation</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={2}
                className="w-16 bg-[#8A3FFC] border border-[#8A3FFC] rounded px-3 py-1 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50"
              />
              <span className="text-gray-400 text-sm">credits</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20">
            <div>
              <h3 className="text-white font-medium">Image2Image</h3>
              <p className="text-gray-400 text-sm">Cost per generation</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={3}
                className="w-16 bg-[#1A1A1A] border border-white/10 rounded px-3 py-1 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50"
              />
              <span className="text-gray-400 text-sm">credits</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20">
            <div>
              <h3 className="text-white font-medium">Text2Video</h3>
              <p className="text-gray-400 text-sm">Cost per generation</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={15}
                className="w-16 bg-[#1A1A1A] border border-white/10 rounded px-3 py-1 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50"
              />
              <span className="text-gray-400 text-sm">credits</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20">
            <div>
              <h3 className="text-white font-medium">Image2Video</h3>
              <p className="text-gray-400 text-sm">Cost per generation</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={10}
                className="w-16 bg-[#1A1A1A] border border-white/10 rounded px-3 py-1 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50"
              />
              <span className="text-gray-400 text-sm">credits</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="w-full bg-[#8A3FFC] hover:opacity-90 text-white py-3 rounded-lg font-medium">
            Update Credit Pricing
          </button>
        </div>
      </div>
    </div>
  );
}


