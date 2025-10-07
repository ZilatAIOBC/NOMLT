import { useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';

export interface EditPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  featuresList?: string[];
  features: {
    textToImage: boolean;
    imageToImage: boolean;
    textToVideo: boolean;
    imageToVideo: boolean;
  };
}

export function EditPlanForm({
  plan,
  onSave,
}: {
  plan: EditPlan;
  onSave: (payload: Partial<{ display_name: string; price_monthly: number; credits_included: number; features: string[] }>) => Promise<void>;
}) {
  const [editableName, setEditableName] = useState<string>(plan.name);
  const [editablePriceStr, setEditablePriceStr] = useState<string>(String(plan.price ?? ''));
  const [editableCreditsStr, setEditableCreditsStr] = useState<string>(String(plan.credits ?? ''));
  const [editableFeaturesText, setEditableFeaturesText] = useState<string>((plan.featuresList || []).join('\n'));
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync form when selected plan changes
  useEffect(() => {
    setEditableName(plan.name);
    setEditablePriceStr(String(plan.price ?? ''));
    setEditableCreditsStr(String(plan.credits ?? ''));
    setEditableFeaturesText((plan.featuresList || []).join('\n'));
  }, [plan.id, plan.price, plan.credits, plan.featuresList]);

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const featuresParsed = (editableFeaturesText || '')
        .split(/\n/)
        .map((s) => (s || '').trim())
        .filter((s) => s.length > 0);
      const priceVal = parseFloat(editablePriceStr);
      const creditsVal = parseInt(editableCreditsStr, 10);
      // Infer credits from features line like "5,000 credits per month" if user edited only features
      let creditsFromFeatures: number | undefined = undefined;
      for (const line of featuresParsed) {
        const match = line.match(/([0-9][0-9,\.]*)\s*credits\s*per\s*month/i);
        if (match && match[1]) {
          const num = parseInt(match[1].replace(/[,.]/g, ''), 10);
          if (!Number.isNaN(num)) {
            creditsFromFeatures = num;
            break;
          }
        }
      }
      const payload: Partial<{ display_name: string; price_monthly: number; credits_included: number; features: string[] }> = {};
      const trimmedName = (editableName || '').trim();
      if (trimmedName && trimmedName !== plan.name) payload.display_name = trimmedName;
      if (!isNaN(priceVal) && priceVal !== plan.price) payload.price_monthly = priceVal;
      if (!isNaN(creditsVal) && creditsVal !== plan.credits) {
        payload.credits_included = creditsVal;
      } else if (creditsFromFeatures !== undefined && creditsFromFeatures !== plan.credits) {
        // If credits input not changed but features indicate a different credits amount, update it too
        payload.credits_included = creditsFromFeatures;
      }
      const originalFeaturesText = (plan.featuresList || []).join('\n');
      if ((editableFeaturesText || '').trim() !== originalFeaturesText.trim()) payload.features = featuresParsed;
      await onSave(payload);

      // Immediately reflect updated values in inputs without requiring a refresh
      if (payload.price_monthly !== undefined) {
        setEditablePriceStr(String(payload.price_monthly));
      }
      if (payload.credits_included !== undefined) {
        setEditableCreditsStr(String(payload.credits_included));
      } else if (creditsFromFeatures !== undefined) {
        setEditableCreditsStr(String(creditsFromFeatures));
      }

      // Also reflect the updated credits line inside the features editor
      const creditsToApply = payload.credits_included ?? creditsFromFeatures;
      if (typeof creditsToApply === 'number' && Number.isFinite(creditsToApply)) {
        const creditsLine = `${creditsToApply.toLocaleString()} credits per month`;
        let lines = [...featuresParsed];
        let found = false;
        lines = lines.map((l) => {
          if (typeof l === 'string' && l.toLowerCase().includes('credits per month')) {
            found = true;
            return creditsLine;
          }
          return l;
        });
        if (!found) {
          lines.unshift(creditsLine);
        }
        setEditableFeaturesText(lines.join('\n'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="rounded-lg border border-white/10 p-6"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Edit2 size={20} className="text-white" />
        <h2 className="text-xl font-bold text-white">Edit Plan: {plan.name}</h2>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name</label>
          <input type="text" value={editableName} onChange={(e) => setEditableName(e.target.value)} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#823AEA]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
          <input type="number" value={editablePriceStr} onChange={(e) => setEditablePriceStr(e.target.value)} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#823AEA]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Credits</label>
          <input type="number" value={editableCreditsStr} onChange={(e) => setEditableCreditsStr(e.target.value)} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#823AEA]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Features (one per line)</label>
          <textarea value={editableFeaturesText} onChange={(e) => setEditableFeaturesText(e.target.value)} rows={6} placeholder={'e.g.\n4,000 credits per month\nPriority queue\nCommercial use'} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#823AEA] resize-y" />
          <p className="text-xs text-gray-400 mt-2">Tip: Enter one feature per line. Commas are preserved within a line. The credits line updates automatically when credits change.</p>
        </div>

        {/* Feature Access (read-only toggles) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">Feature Access</label>
          <div className="space-y-6">
            {[
              { key: 'textToImage', label: 'Text2Image' },
              { key: 'imageToImage', label: 'Image2Image' },
              { key: 'textToVideo', label: 'Text2Video' },
              { key: 'imageToVideo', label: 'Image2Video' },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center justify-between">
                <span className="text-white">{feature.label}</span>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    (plan.features as any)[feature.key]
                      ? 'bg-[#823AEA]'
                      : 'bg-gray-600'
                  }`}
                  disabled
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      (plan.features as any)[feature.key]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-10">
          <button onClick={handleSubmit} disabled={isSaving} className={`bg-[#8A3FFC] text-white px-8 py-3 rounded-lg font-medium flex-1 mr-4 ${isSaving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}>
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPlanForm;


