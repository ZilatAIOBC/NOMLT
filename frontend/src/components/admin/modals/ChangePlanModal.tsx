import { useEffect, useState } from "react";
import {
  plansService,
  PlanWithPricing,
  BillingCycle,
} from "../../../services/plansService";

interface ChangePlanModalProps {
  open: boolean;
  user: { id: string; name: string; email: string; plan?: string } | null;
  onClose: () => void;
  onSubmit: (
    userId: string,
    newPlanId: string,
    interval: "monthly" | "yearly"
  ) => Promise<void> | void;
}

export default function ChangePlanModal({
  open,
  user,
  onClose,
  onSubmit,
}: ChangePlanModalProps) {
  // --- hooks: always top-level ---
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<PlanWithPricing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // lock scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // fetch plans on open
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await plansService.getPlansWithPricing();
        setPlans(data);
        setSelectedPlanId(null); // reset selection each open
      } catch (e: any) {
        setError(e?.message || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  // helpers (no hooks)
  const getPlanColor = (plan: string) => {
    const planLower = plan.toLowerCase();
    if (planLower.includes("pro") || planLower.includes("premium")) {
      return "bg-purple-500/20 text-purple-400";
    } else if (planLower.includes("basic")) {
      return "bg-blue-500/20 text-blue-400";
    } else if (planLower.includes("free")) {
      return "bg-gray-500/20 text-gray-400";
    }
    return "bg-gray-500/20 text-gray-400";
  };
  const capitalizeFirst = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  const currentPlanName = user?.plan ?? "Free";

  // submit final change
  const handleSubmit = async () => {
    if (!user || !selectedPlanId) return;
    const chosen = plans.find((p) => p.id === selectedPlanId);
    if (!chosen) return;

    // ensure selected cycle is configured
    const priceId =
      cycle === "yearly"
        ? chosen.stripe_price_id_yearly
        : chosen.stripe_price_id_monthly;
    if (!priceId) return;

    try {
      setSubmitting(true);
      await onSubmit(user.id, selectedPlanId, cycle);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-plan-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl">
        {/* Header */}
        <div className="relative">
          <div className="h-1 w-full bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB]" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="px-6 pt-5 pb-2">
            <h2
              id="change-plan-title"
              className="text-white text-xl font-semibold"
            >
              Change Plan
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Select a plan and click “Submit Change Plan”.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* User header */}
          <div className="mb-5 bg-[#0F0F0F] p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            {currentPlanName && (
              <span
                className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(
                  currentPlanName
                )}`}
              >
                {capitalizeFirst(currentPlanName)}
              </span>
            )}
          </div>

          {/* Cycle toggle */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#0C111C]/80 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  cycle === "monthly"
                    ? "text-white bg-[#763EEA] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                    : "text-white/90 hover:bg-white/5"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle("yearly")}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  cycle === "yearly"
                    ? "text-white bg-[#763EEA] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                    : "text-white/90 hover:bg-white/5"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Plans (selectable, no features) */}
          <div className="space-y-2">
            {loading && (
              <div className="text-gray-400 text-sm">Loading plans…</div>
            )}
            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {!loading && !error && plans.length === 0 && (
              <div className="text-gray-400 text-sm">No plans available.</div>
            )}

            {!loading &&
              !error &&
              plans.map((plan) => {
                const priceObj = plan.priceByCycle[cycle];
                const priceId =
                  cycle === "yearly"
                    ? plan.stripe_price_id_yearly
                    : plan.stripe_price_id_monthly;
                const unsupported = !priceId;
                const isSelected = selectedPlanId === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => !unsupported && setSelectedPlanId(plan.id)}
                    disabled={unsupported}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                      unsupported
                        ? "border-white/10 bg-[#0F0F0F] opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "border-[#763EEA] bg-[#0D131F] shadow-[0_0_0_1px_rgba(118,62,234,0.3)_inset]"
                        : "border-white/10 bg-[#0F0F0F] hover:bg-white/5"
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-white text-sm font-medium">
                        {plan.display_name.charAt(0).toUpperCase() +
                          plan.display_name.slice(1)}
                      </div>

                      <div className="text-xs text-gray-400">
                        {priceObj?.currency}
                        <span className="ml-1 text-white font-semibold">
                          {priceObj?.amount}
                        </span>{" "}
                        <span className="text-gray-400">
                          {priceObj?.cadenceLabel}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs">
                      {unsupported ? (
                        <span className="text-gray-500">Not available</span>
                      ) : isSelected ? (
                        <span className="text-[#A78BFA] font-medium">
                          Selected
                        </span>
                      ) : (
                        <span className="text-white/90">Choose</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-2 border-t border-white/10 bg-[#101010]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-[#0F0F0F] border border-white/10 text-white hover:bg-white/5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedPlanId || submitting}
            className={`px-4 py-2 rounded-lg text-white text-sm inline-flex items-center justify-center ${
              !selectedPlanId || submitting
                ? "bg-[#0F0F0F] border border-white/10 opacity-60 cursor-not-allowed"
                : "bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] hover:opacity-95"
            }`}
          >
            {submitting ? "Submitting…" : "Submit Change Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
