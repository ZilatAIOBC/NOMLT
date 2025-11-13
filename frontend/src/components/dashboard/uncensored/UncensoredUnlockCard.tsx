// src/components/dashboard/uncensored/UncensoredUnlockCard.tsx

import React from "react";
import { ShieldOff, Check } from "lucide-react";
import { toast } from "react-hot-toast";

const UncensoredUnlockCard: React.FC<{ price: number | null }> = ({
  price,
}) => {
  const handleUnlockClick = () => {
    // TODO: payment workflow
    toast.success("Preparing Uncensored Mode checkout…");
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#121212] shadow-[0_18px_60px_rgba(0,0,0,0.6)] px-6 py-7 md:px-8 md:py-9">
      <div className="mb-5">
        <div className="text-xs font-medium tracking-[0.18em] uppercase text-white/50">
          One-time payment
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm text-white/80">USD</span>
          <span className="text-3xl md:text-4xl font-semibold text-white">
            {price !== null ? price : "—"}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-white/50">
          No subscription. Pay once, keep forever.
        </div>
      </div>

      <button
        type="button"
        onClick={handleUnlockClick}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm md:text-[15px] font-medium text-white bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] hover:opacity-95 transition-opacity mb-6"
      >
        <ShieldOff className="w-4 h-4" />
        <span>Unlock Uncensored Mode</span>
      </button>

      <ul className="space-y-3 text-sm md:text-[15px] text-white/90">
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 text-gray-400 shrink-0" />
          <span>Reduced content filtering for creative and adult themes.</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 text-gray-400 shrink-0" />
          <span>More freedom in Image + Video AI tools.</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 text-gray-400 shrink-0" />
          <span>One-time unlock tied to your account.</span>
        </li>
      </ul>

      <p className="mt-6 text-[11px] text-white/40">
        Some content types may still be restricted due to legal or safety rules.
      </p>
    </div>
  );
};

export default UncensoredUnlockCard;
