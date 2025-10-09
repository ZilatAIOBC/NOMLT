import React from 'react';
import { AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPeriodEnd: string | null;
  isLoading: boolean;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPeriodEnd,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500/10 to-red-500/10 border-b border-rose-500/20 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Cancel Subscription?</h3>
                <p className="text-sm text-white/60 mt-1">This action can be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-white/80 text-sm">
                You'll retain access until the end of your billing period
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-white/80 text-sm">
                You can reactivate anytime before the period ends
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-white/80 text-sm">
                No charges will be applied after cancellation
              </p>
            </div>
          </div>

          {currentPeriodEnd && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
              <p className="text-blue-400 text-sm">
                <span className="font-semibold">Access until:</span>{' '}
                {new Date(currentPeriodEnd).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#121212] border-t border-white/10 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Canceling...
              </>
            ) : (
              'Yes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionModal;

