// src/pages/dashboard/UncensoredMode.tsx

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TopHeader from "../../components/dashboard/TopHeader";
import HeaderBar from "../../components/dashboard/HeaderBar";
import UncensoredHero from "../../components/dashboard/uncensored/UncensoredHero";
import UncensoredUnlockCard from "../../components/dashboard/uncensored/UncensoredUnlockCard";
import UncensoredFAQAccordion from "../../components/dashboard/uncensored/UncensoredFAQAccordion";
import adminAddonService from "../../services/adminAddonService";
import { toast } from "react-hot-toast";

const ADDON_ID = "88915505-af3c-49d5-9fc2-82a7f6b4874a";

const UncensoredMode: React.FC = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  // Load dynamic add-on price
  useEffect(() => {
    const loadAddonPrice = async () => {
      try {
        const addon = await adminAddonService.adminGetAddonById(ADDON_ID);
        setPrice(addon.price);
      } catch (error: any) {
        toast.error(error.message || "Failed to load add-on price");
      }
    };

    loadAddonPrice();
  }, []);

  // Handle success / cancel query params from Stripe redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "1" || success === "true") {
      toast.success(
        "Uncensored Mode payment successful! It may take a moment for your account to update."
      );
    } else if (canceled === "1" || canceled === "true") {
      toast("Checkout canceled. No charges were made.", { icon: "ℹ️" });
    }

    if (success || canceled) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("success");
      newSearchParams.delete("canceled");

      const newUrl =
        window.location.pathname +
        (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  return (
    <div className="ml-16 lg:ml-64 h-screen overflow-y-auto transition-all duration-300">
      <HeaderBar>
        <TopHeader />
      </HeaderBar>

      <div className="p-8 pt-24">
        <UncensoredHero price={price} />

        <section className="w-full flex justify-center mb-16 md:mb-24">
          <UncensoredUnlockCard price={price} addonId={ADDON_ID} />
        </section>

        <div className="mt-10 md:mt-0">
          <UncensoredFAQAccordion />
        </div>
      </div>
    </div>
  );
};

export default UncensoredMode;
