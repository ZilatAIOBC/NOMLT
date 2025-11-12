import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "../../../services/adminUsersService";
import { X, Plus, Minus } from "lucide-react";

type MinimalUser = Pick<User, "id" | "name" | "email">;

interface ChangeCreditsModalProps {
  open: boolean;
  user: (MinimalUser & { credits?: number }) | null;
  onClose: () => void;
  onSubmit: (userId: string, creditsDelta: number) => Promise<void> | void;
  step?: number;
  maxCredits?: number;
}

export default function ChangeCreditsModal({
  open,
  user,
  onClose,
  onSubmit,
  step = 10,
  maxCredits,
}: ChangeCreditsModalProps) {
  const [creditsInput, setCreditsInput] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Refs/effects – always called
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setCreditsInput("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ---- derive/validate BEFORE any conditional return (hooks must run every render)
  const trimmed = creditsInput.trim();
  const parsed = Number(trimmed);
  const isEmpty = trimmed === "";
  const isNumber = !Number.isNaN(parsed) && Number.isFinite(parsed);
  const isInt = isNumber && Number.isInteger(parsed);
  const min = 0;
  const overMax = maxCredits !== undefined && parsed > maxCredits;
  const belowMin = isNumber && parsed < min;
  const isValid = !isEmpty && isNumber && isInt && !belowMin && !overMax;
  const canSubmit = isValid && !submitting;

  // user may be null here, so guard with optional chaining
  const current = typeof user?.credits === "number" ? user!.credits : undefined;
  const newTotal =
    isValid && typeof current === "number" ? current + parsed : undefined;

  const helperText = useMemo(() => {
    if (isEmpty) return "Enter a non-negative whole number to add.";
    if (!isNumber) return "Value must be a number.";
    if (!isInt) return "Credits to add must be a whole number.";
    if (belowMin) return "Credits cannot be negative.";
    if (overMax)
      return `Maximum allowed to add is ${maxCredits?.toLocaleString()}.`;
    return " ";
  }, [isEmpty, isNumber, isInt, belowMin, overMax, maxCredits]);

  // ---- only now is it safe to short-circuit render
  if (!open || !user) return null;

  const bump = (delta: number) => {
    const base = isNumber ? parsed : 0;
    let next = Math.max(min, base + delta);
    if (maxCredits !== undefined) next = Math.min(maxCredits, next);
    setCreditsInput(String(next));
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit(user.id, parsed);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-credits-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 transform transition-all duration-150 ease-out">
        <form
          onSubmit={onFormSubmit}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl"
        >
          {/* Header */}
          <div className="relative">
            <div className="h-1 w-full bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB]" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="px-6 pt-5 pb-2">
              <h2
                id="add-credits-title"
                className="text-white text-xl font-semibold"
              >
                Add Credits
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Add credits to this user’s balance.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-2">
            <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {user.name}
                </div>
                <div className="text-gray-400 text-sm truncate">
                  {user.email}
                </div>
              </div>
              {typeof current === "number" && (
                <span className="whitespace-nowrap text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/20">
                  Current: {current.toLocaleString()}
                </span>
              )}
            </div>

            <label className="block text-sm text-gray-300 mt-5 mb-2">
              Add credit amount
            </label>
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => bump(-step)}
                className="px-3 rounded-lg bg-[#0F0F0F] border border-white/10 text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                aria-label={`Decrease by ${step}`}
              >
                <Minus size={16} />
              </button>

              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={creditsInput}
                onChange={(e) => setCreditsInput(e.target.value)}
                placeholder="e.g., 500"
                className={`w-full px-3 py-2 rounded-lg bg-[#0F0F0F] border text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 ${
                  !isEmpty && !isValid ? "border-red-500/40" : "border-white/10"
                }`}
                aria-invalid={!isEmpty && !isValid}
                aria-describedby="credits-help"
              />

              <button
                type="button"
                onClick={() => bump(step)}
                className="px-3 rounded-lg bg-[#0F0F0F] border border-white/10 text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                aria-label={`Increase by ${step}`}
              >
                <Plus size={16} />
              </button>
            </div>

            <div
              id="credits-help"
              className={`mt-1 text-xs ${
                !isEmpty && !isValid ? "text-red-400" : "text-gray-400"
              }`}
            >
              {helperText}
            </div>

            {typeof current === "number" &&
              !isEmpty &&
              isNumber &&
              parsed >= 0 && (
                <div className="mt-3 text-sm text-gray-300">
                  New total:&nbsp;
                  <span className="text-gray-400">
                    {current.toLocaleString()}
                  </span>
                  <span className="mx-1">+</span>
                  <span className="text-gray-400">
                    {Math.floor(parsed).toLocaleString()}
                  </span>
                  <span className="mx-1">=</span>
                  <span className="font-semibold text-white">
                    {(
                      current + Math.floor(Math.max(0, parsed))
                    ).toLocaleString()}
                  </span>
                </div>
              )}

            {maxCredits !== undefined && (
              <div className="mt-2 text-[11px] text-gray-500">
                You can add up to {maxCredits.toLocaleString()} credits at once.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-white/10 bg-[#101010]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-[#0F0F0F] border border-white/10 text-white hover:bg-white/5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-lg text-white text-sm inline-flex items-center justify-center ${
                canSubmit
                  ? "bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] hover:opacity-95"
                  : "bg-[#0F0F0F] border border-white/10 opacity-60 cursor-not-allowed"
              }`}
            >
              {submitting && (
                <span className="mr-2 inline-block h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? "Updating..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
