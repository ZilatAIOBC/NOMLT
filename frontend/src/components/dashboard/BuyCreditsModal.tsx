import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createTopupSession, TopupPackId } from '../../services/paymentService';
import { toast } from 'react-hot-toast';

type Props = {
  open: boolean;
  onClose: () => void;
};

const PACKS: Array<{ id: TopupPackId; name: string; credits: number; priceLabel: string }>= [
  { id: 'small', name: '7,000 Credits', credits: 7000, priceLabel: '$5' },
  { id: 'medium', name: '15,000 Credits', credits: 15000, priceLabel: '$20' },
  { id: 'large', name: '18,000 Credits', credits: 18000, priceLabel: '$30' },
];

const BuyCreditsModal: React.FC<Props> = ({ open, onClose }) => {
  const [processing, setProcessing] = useState<TopupPackId | null>(null);

  if (!open) return null;

  const handleBuy = async (packId: TopupPackId) => {
    try {
      setProcessing(packId);

      const authUserRaw = localStorage.getItem('authUser');
      if (!authUserRaw) {
        toast.error('Please sign in');
        setProcessing(null);
        return;
      }
      let userId: string | undefined;
      try {
        const parsed = JSON.parse(authUserRaw);
        userId = parsed?.id || parsed?.user?.id;
      } catch {
        // ignore
      }
      if (!userId) {
        toast.error('User not found. Please sign in again.');
        setProcessing(null);
        return;
      }

      console.log('[frontend][topup] creating session', { packId, userId });
      const { url } = await createTopupSession({ packId, userId });
      console.log('[frontend][topup] checkout url received', { url });
      if (!url) {
        toast.error('Failed to start checkout');
        setProcessing(null);
        return;
      }
      console.log('[frontend][topup] redirecting to checkout');
      window.location.href = url;
    } catch (err: any) {
      console.warn('[frontend][topup] failed to create session', err);
      toast.error(err?.message || 'Failed to initiate purchase');
      setProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B0B0B] p-6 text-white shadow-xl">
        <button onClick={onClose} className="absolute right-3 top-3 p-2 text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-1">Buy credits</h3>
        <p className="text-sm text-white/60 mb-5">Choose a top-up pack. Payment is handled securely by Stripe.</p>

        <div className="space-y-3">
          {PACKS.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-white/60">{p.credits.toLocaleString()} credits</div>
              </div>
              <button
                onClick={() => handleBuy(p.id)}
                disabled={processing !== null}
                className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3 py-2 text-sm disabled:opacity-50"
              >
                {processing === p.id ? 'Processing...' : `Buy ${p.priceLabel}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyCreditsModal;


