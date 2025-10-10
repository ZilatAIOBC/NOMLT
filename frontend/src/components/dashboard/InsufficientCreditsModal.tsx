import React from 'react';
import { X, AlertTriangle, Coins, Crown, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  required: number;
  current: number;
  shortfall: number;
  generationType: string;
}

const InsufficientCreditsModal: React.FC<InsufficientCreditsModalProps> = ({
  isOpen,
  onClose,
  required,
  current,
  shortfall,
  generationType
}) => {
  if (!isOpen) return null;

  const getGenerationName = (type: string) => {
    const names: { [key: string]: string } = {
      text_to_image: 'Text to Image',
      image_to_image: 'Image to Image',
      text_to_video: 'Text to Video',
      image_to_video: 'Image to Video'
    };
    return names[type] || type;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Insufficient Credits</h2>
              <p className="text-sm text-white/60">You don't have enough credits</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Credit Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/60">Generation Type:</span>
              <span className="text-sm font-medium text-white">{getGenerationName(generationType)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/60">Required Credits:</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">{required.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/60">Your Balance:</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">{current.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="text-sm text-white/60">You Need:</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-red-400" />
                <span className="text-sm font-bold text-red-400">+{shortfall.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/dashboard/billing"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Crown className="w-4 h-4" />
              Upgrade Your Plan
            </Link>

            <Link
              to="/dashboard/credits"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Buy More Credits
            </Link>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;

