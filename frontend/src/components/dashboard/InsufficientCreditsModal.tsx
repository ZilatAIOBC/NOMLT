import React from 'react';
import { X, AlertTriangle, Coins, Crown, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-rose-500/10 to-red-500/10 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
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
                <Coins className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">{required.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/60">Your Balance:</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-semibold text-rose-400">{current.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="text-sm text-white/60">You Need:</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold text-rose-400">+{shortfall.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link to="/dashboard/subscription" className="block">
              <Button
                variant="primary"
                size="md"
                icon={Crown}
                className="w-full"
              >
                Upgrade Your Plan
              </Button>
            </Link>

            <Link to="/dashboard/credits" className="block">
              <Button
                variant="secondary"
                size="md"
                icon={CreditCard}
                className="w-full"
              >
                Buy More Credits
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="w-full bg-white/5 border border-white/10 text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;

