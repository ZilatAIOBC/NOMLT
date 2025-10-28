import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const typeConfig = {
    danger: {
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      iconBorder: 'border-red-500/20',
      accent: 'border-red-500/30',
      accentBar: 'from-red-500 to-red-600',
      buttonGradient: 'from-red-500 to-red-600',
      buttonHover: 'hover:from-red-600 hover:to-red-700',
      buttonShadow: 'shadow-red-500/20 hover:shadow-red-500/30',
    },
    warning: {
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      iconBorder: 'border-yellow-500/20',
      accent: 'border-yellow-500/30',
      accentBar: 'from-yellow-500 to-yellow-600',
      buttonGradient: 'from-yellow-500 to-yellow-600',
      buttonHover: 'hover:from-yellow-600 hover:to-yellow-700',
      buttonShadow: 'shadow-yellow-500/20 hover:shadow-yellow-500/30',
    },
    info: {
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      iconBorder: 'border-blue-500/20',
      accent: 'border-blue-500/30',
      accentBar: 'from-blue-500 to-blue-600',
      buttonGradient: 'from-blue-500 to-blue-600',
      buttonHover: 'hover:from-blue-600 hover:to-blue-700',
      buttonShadow: 'shadow-blue-500/20 hover:shadow-blue-500/30',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-[#18181B] rounded-2xl border border-[#27272A] shadow-2xl max-w-md w-full overflow-hidden" style={{ animation: 'modalFadeIn 0.2s ease-out' }}>
        {/* Animated accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.accentBar}`}></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-8 pt-10">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-xl ${config.iconBg} border ${config.iconBorder} flex items-center justify-center flex-shrink-0`}>
              <AlertTriangle className={`w-7 h-7 ${config.iconColor}`} strokeWidth={2.5} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {title}
              </h3>
            </div>
          </div>

          {/* Message */}
          <p className="text-white/70 text-sm leading-relaxed mb-8 pl-[72px]">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] hover:border-[#52525B] text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg bg-gradient-to-r ${config.buttonGradient} ${config.buttonHover} text-white text-sm font-semibold transition-all duration-200 shadow-lg ${config.buttonShadow} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;

