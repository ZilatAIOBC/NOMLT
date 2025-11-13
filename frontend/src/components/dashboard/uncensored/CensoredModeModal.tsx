import React from "react";
import { ShieldAlert, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CensoredModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nsfwWord?: string | null;
  planName?: string | null;
  reason?: string | null;
  unfilteredModeUrl?: string;
}

const reasonToMessage = (reason?: string | null, planName?: string | null) => {
  const name = planName || "your current plan";

  switch (reason) {
    case "basic_or_standard":
      return `${name} uses Censored Mode by default, which blocks NSFW or adult content.`;
    case "no_subscription":
      return "You don’t have an active subscription, so Censored Mode is enabled by default for safety.";
    case "admin_override_unfiltered":
      // This normally wouldn't show for CENSORED_MODE_BLOCKED, but handle just in case.
      return "Your account is managed by an admin. Please contact support if this seems incorrect.";
    case "unknown_plan":
      return "We couldn’t match your plan tier, so Censored Mode is enabled by default for safety.";
    case "db_error":
      return "We couldn’t verify your subscription details right now, so Censored Mode is enabled by default.";
    case "no_user":
      return "We couldn’t identify your account. Please sign in again and retry.";
    default:
      return "Censored Mode is currently enabled for your account, which blocks NSFW or adult content.";
  }
};

const CensoredModeModal: React.FC<CensoredModeModalProps> = ({
  isOpen,
  onClose,
  nsfwWord,
  planName,
  reason,
  unfilteredModeUrl = "/dashboard/uncensored",
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToUnfiltered = () => {
    onClose();
    navigate(unfilteredModeUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] shadow-[0_18px_60px_rgba(0,0,0,0.7)] p-6 z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center border border-red-500/40">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-white">
                Censored Mode is Enabled
              </h2>
              <p className="text-xs text-red-300/80 mt-0.5">
                Your prompt contains content blocked by Censored Mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 text-sm text-gray-200">
          {nsfwWord && (
            <p>
              We detected the following restricted term in your prompt:{" "}
              <span className="font-mono text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">
                {nsfwWord}
              </span>
              .
            </p>
          )}

          <p className="text-gray-300">{reasonToMessage(reason, planName)}</p>

          <p className="text-gray-400 text-xs leading-relaxed mt-1.5">
            Pro accounts have Unfiltered Mode enabled by default. Basic and
            Standard plans use Censored Mode unless your account is explicitly
            granted Unfiltered Mode or you unlock the Uncensored add-on.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleGoToUnfiltered}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] hover:opacity-95 transition-opacity"
          >
            Go to Unfiltered Mode
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Edit Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

export default CensoredModeModal;
