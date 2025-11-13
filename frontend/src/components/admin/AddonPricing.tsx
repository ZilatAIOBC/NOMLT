// src/components/admin/AddonPricing.tsx

import React, { useEffect, useState } from "react";
import { Loader2, ShieldOff } from "lucide-react";
import { toast } from "react-hot-toast";
import adminAddonService, {
  type AdminAddon,
} from "../../services/adminAddonService";

type PriceMap = Record<string, string>;
type OriginalPriceMap = Record<string, number>;

export default function AddonPricing() {
  const [addons, setAddons] = useState<AdminAddon[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [originalPrices, setOriginalPrices] = useState<OriginalPriceMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const parseOrNull = (val: string): number | null => {
    if (val === "" || val === null || val === undefined) return null;
    const n = parseInt(val, 10);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  };

  const iconForAddon = (addon: AdminAddon) => {
    if (addon.addon_key === "uncensored_mode") {
      return <ShieldOff className="w-5 h-5 text-purple-400" />;
    }
    return <ShieldOff className="w-5 h-5 text-gray-400" />;
  };

  // Fetch addons on mount
  useEffect(() => {
    const fetchAddons = async () => {
      try {
        setLoading(true);
        const data = await adminAddonService.adminGetAddons();

        setAddons(data);

        const priceMap: PriceMap = {};
        const originalMap: OriginalPriceMap = {};
        data.forEach((addon) => {
          priceMap[addon.id] = String(addon.price ?? 0);
          originalMap[addon.id] = addon.price ?? 0;
        });

        setPrices(priceMap);
        setOriginalPrices(originalMap);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load add-on pricing");
        setAddons([]);
        setPrices({});
        setOriginalPrices({});
      } finally {
        setLoading(false);
      }
    };

    fetchAddons();
  }, []);

  const handlePriceChange = (addonId: string, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setPrices((prev) => ({
      ...prev,
      [addonId]: cleaned,
    }));
  };

  const addonsWithState = addons.map((addon) => {
    const priceStr = prices[addon.id] ?? "";
    const parsed = parseOrNull(priceStr);
    const original = originalPrices[addon.id];
    const isInvalid = parsed === null;
    const isChanged =
      original !== undefined && !isInvalid && parsed !== original;

    return {
      addon,
      priceStr,
      parsed,
      isInvalid,
      isChanged,
    };
  });

  const changesCount = addonsWithState.filter((x) => x.isChanged).length;
  const hasInvalidInputs = addonsWithState.some((x) => x.isInvalid);

  const handleSave = async () => {
    if (saving) return;

    if (hasInvalidInputs) {
      toast.error(
        "Please enter valid non-negative whole numbers for all add-ons."
      );
      return;
    }

    if (changesCount === 0) {
      toast("No changes to save", { icon: "ℹ️" });
      return;
    }

    try {
      setSaving(true);

      const changedAddons = addonsWithState.filter(
        (x) => x.isChanged && x.parsed !== null
      );

      // Call backend for each changed addon
      const results = await Promise.allSettled(
        changedAddons.map(({ addon, parsed }) =>
          adminAddonService.adminUpdateAddonPrice(addon.id, parsed as number)
        )
      );

      let successCount = 0;
      let failureCount = 0;

      const newOriginals: OriginalPriceMap = { ...originalPrices };
      const updatedAddons: AdminAddon[] = [...addons];

      results.forEach((result, index) => {
        const { addon, parsed } = changedAddons[index];

        if (result.status === "fulfilled") {
          successCount += 1;
          const updated = result.value as AdminAddon;

          // Update originalPrices map
          newOriginals[addon.id] = parsed as number;

          // Update local addons array with fresh data from backend
          const idx = updatedAddons.findIndex((a) => a.id === addon.id);
          if (idx !== -1) {
            updatedAddons[idx] = updated;
          }
        } else {
          failureCount += 1;
        }
      });

      setOriginalPrices(newOriginals);
      setAddons(updatedAddons);

      if (successCount > 0 && failureCount === 0) {
        toast.success(
          successCount === 1
            ? "Add-on price updated successfully."
            : `Add-on prices updated successfully (${successCount}).`
        );
      } else if (successCount > 0 && failureCount > 0) {
        toast.error(
          `Some add-ons were updated (${successCount}), but ${failureCount} failed.`
        );
      } else {
        toast.error("Failed to update add-on pricing.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to save add-on pricing");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const resetPrices: PriceMap = {};
    addons.forEach((addon) => {
      const original = originalPrices[addon.id];
      resetPrices[addon.id] = original !== undefined ? String(original) : "0";
    });
    setPrices(resetPrices);
    toast("Changes discarded", { icon: "↩️" });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-7 w-64 bg-white/10 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-white/5 rounded animate-pulse"></div>
          </div>
        </div>

        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)",
          }}
        >
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-48 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-4 w-72 bg-white/5 rounded animate-pulse"></div>
                  <div className="h-3 w-40 bg-white/5 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-10 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <div className="flex-1 h-12 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && addons.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Add-on Pricing</h2>
        <p className="text-gray-400 text-sm">
          No add-ons found in the database. Create at least one row in the
          <span className="font-mono mx-1">addon_prices</span> table (e.g.{" "}
          <span className="font-mono">uncensored_mode</span>) to configure
          pricing here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Add-on Pricing</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage one-time pricing for Uncensored Mode and other add-ons.
            Changes here control how much is charged for each account unlock.
          </p>
        </div>
      </div>

      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)",
        }}
      >
        <div className="space-y-4">
          {addonsWithState.map(({ addon, priceStr, isInvalid, isChanged }) => (
            <div
              key={addon.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                isInvalid
                  ? "border-red-500 bg-red-500/5"
                  : isChanged
                  ? "border-yellow-500 bg-yellow-500/5"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <div className="flex-1 flex items-start gap-3">
                <div className="mt-1">{iconForAddon(addon)}</div>
                <div>
                  <h3 className="text-white font-medium">
                    {addon.label || addon.addon_key}
                    {!addon.is_active && (
                      <span className="ml-2 text-xs rounded-full bg-gray-700 px-2 py-0.5 text-gray-300">
                        Inactive
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    One-time add-on unlock priced in {addon.currency || "USD"}.
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Key: <span className="font-mono">{addon.addon_key}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">
                  {addon.currency || "USD"}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={priceStr}
                  onChange={(e) => handlePriceChange(addon.id, e.target.value)}
                  className={`w-24 border rounded px-3 py-2 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50 ${
                    isInvalid
                      ? "bg-red-500/10 border-red-500"
                      : isChanged
                      ? "bg-yellow-500/20 border-yellow-500"
                      : "bg-[#1A1A1A] border-white/10"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || hasInvalidInputs || changesCount === 0}
            className="flex-1 bg-[#8A3FFC] hover:opacity-90 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              `Save Add-on Pricing${
                changesCount > 0 ? ` (${changesCount})` : ""
              }`
            )}
          </button>

          {changesCount > 0 && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
