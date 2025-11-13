// src/components/dashboard/uncensored/UncensoredHero.tsx

import React from "react";
import { ShieldOff } from "lucide-react";

const UncensoredHero: React.FC<{ price: number | null }> = ({ price }) => {
  return (
    <section className="w-full max-w-4xl mx-auto text-center mb-10 md:mb-14">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.12em] text-white/70 mb-4">
        <ShieldOff className="w-3.5 h-3.5" />
        <span>Exclusive Add-On</span>
      </div>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
        Uncensored Mode
      </h1>

      <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Tired of those pesky filters holding back your wildest ideas? Sick of AI
        babysitters telling you &quot;no&quot;? Unlock full creative freedom.
      </p>

      <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed mt-4">
        For a one-time payment of{" "}
        <span className="font-semibold text-white">
          {price !== null ? `$${price}` : "Loading..."}
        </span>
        , you&apos;ll unlock Uncensored Mode.
      </p>
    </section>
  );
};

export default UncensoredHero;
