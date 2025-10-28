import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import creditPricingService, { type CategoryPricingData } from '../../services/creditPricingService';
import { Loader2, AlertCircle } from 'lucide-react';

interface PricingNumbers {
  text_to_image: number;
  image_to_image: number;
  text_to_video: number;
  image_to_video: number;
}

interface PricingState {
  text_to_image: string; // keep as string to allow empty while editing
  image_to_image: string;
  text_to_video: string;
  image_to_video: string;
}

const CATEGORY_LABELS: Record<keyof PricingState, { title: string; description: string }> = {
  text_to_image: {
    title: 'Text to Image',
    description: 'Generate images from text descriptions'
  },
  image_to_image: {
    title: 'Image to Image',
    description: 'Transform and enhance existing images'
  },
  text_to_video: {
    title: 'Text to Video',
    description: 'Generate videos from text descriptions'
  },
  image_to_video: {
    title: 'Image to Video',
    description: 'Create videos from static images'
  }
};

export default function CreditPricing() {
  const [pricing, setPricing] = useState<PricingState>({
    text_to_image: '30',
    image_to_image: '30',
    text_to_video: '80',
    image_to_video: '80'
  });
  const [originalPricing, setOriginalPricing] = useState<PricingNumbers | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modelsUpdated, setModelsUpdated] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<keyof PricingState | null>(null);

  // Helpers to parse/validate current inputs
  const parseOrNull = (val: string): number | null => {
    if (val === '' || val === null || val === undefined) return null;
    const n = parseInt(val, 10);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  };

  // Fetch current pricing on mount
  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const data: CategoryPricingData = await creditPricingService.getCategoryPricing();
      
      const newPricingNumbers: PricingNumbers = {
        text_to_image: data.text_to_image?.cost_per_generation || 30,
        image_to_image: data.image_to_image?.cost_per_generation || 30,
        text_to_video: data.text_to_video?.cost_per_generation || 80,
        image_to_video: data.image_to_video?.cost_per_generation || 80
      };

      setPricing({
        text_to_image: String(newPricingNumbers.text_to_image),
        image_to_image: String(newPricingNumbers.image_to_image),
        text_to_video: String(newPricingNumbers.text_to_video),
        image_to_video: String(newPricingNumbers.image_to_video)
      });
      setOriginalPricing(newPricingNumbers);

      // Store model counts for info display
      const counts: Record<string, number> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value) counts[key] = value.model_count;
      });
      setModelsUpdated(counts);

    } catch (error: any) {
      // Don't show error toast for auth issues - component will use fallback pricing
      if (!error.message?.includes('authentication') && !error.message?.includes('Unauthorized')) {
        toast.error('Could not load pricing from database. Using default values.');
      }
      
      // Use fallback pricing if fetch fails
      setPricing({
        text_to_image: '30',
        image_to_image: '30',
        text_to_video: '80',
        image_to_video: '80'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePricingChange = (category: keyof PricingState, value: string) => {
    // Allow empty while typing; strip non-digits
    const cleaned = value.replace(/[^0-9]/g, '');
    setPricing(prev => ({
      ...prev,
      [category]: cleaned
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare updates object with only changed values
      const updates: Record<string, number> = {};
      (Object.keys(pricing) as Array<keyof PricingState>).forEach(category => {
        const parsed = parseOrNull(pricing[category]);
        if (parsed !== null && originalPricing && parsed !== originalPricing[category]) {
          updates[category] = parsed;
        }
      });

      if (Object.keys(updates).length === 0) {
        toast('No changes to save', { icon: 'ℹ️' });
        return;
      }

      // Validate no invalid inputs remain
      const hasInvalid = (Object.keys(pricing) as Array<keyof PricingState>).some(cat => parseOrNull(pricing[cat]) === null);
      if (hasInvalid) {
        toast.error('Please enter valid non-negative whole numbers for all fields.');
        return;
      }

      // Bulk update all changed categories
      const result = await creditPricingService.bulkUpdateCategoryPricing(updates);

      if (result.success) {
        toast.success(result.message || 'Pricing updated successfully!');
        // Update the original pricing to reflect saved state
        setOriginalPricing({
          text_to_image: parseOrNull(pricing.text_to_image) || 0,
          image_to_image: parseOrNull(pricing.image_to_image) || 0,
          text_to_video: parseOrNull(pricing.text_to_video) || 0,
          image_to_video: parseOrNull(pricing.image_to_video) || 0,
        });
        
        // Update models updated counts
        const counts: Record<string, number> = {};
        result.data.forEach(item => {
          counts[item.category] = item.models_updated;
        });
        setModelsUpdated(counts);
      } else {
        toast.error('Some updates failed.');
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  // Derived UI state
  const changesCount = (Object.keys(pricing) as Array<keyof PricingState>).reduce((acc, cat) => {
    if (!originalPricing) return 0;
    const parsed = parseOrNull(pricing[cat]);
    if (parsed !== null && parsed !== originalPricing[cat]) return acc + 1;
    return acc;
  }, 0);

  const hasInvalidInputs = (Object.keys(pricing) as Array<keyof PricingState>).some(cat => parseOrNull(pricing[cat]) === null);

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
          style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
        >
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
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
                  <div className="w-20 h-10 bg-white/10 rounded animate-pulse"></div>
                  <div className="w-16 h-6 bg-white/5 rounded animate-pulse"></div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Credit Pricing per Feature</h2>
          <p className="text-gray-400 text-sm mt-1">
            Set the credit cost for each generation type. Changes apply to all AI models in each category.
          </p>
        </div>
        {changesCount > 0 && (
          <div className="flex items-center gap-2 text-yellow-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{changesCount} change{changesCount !== 1 ? 's' : ''} pending</span>
          </div>
        )}
      </div>

      <div
        className="rounded-lg border border-white/10 p-6"
        style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
      >
        <div className="space-y-4">
          {(Object.keys(pricing) as Array<keyof PricingState>).map((category) => {
            const label = CATEGORY_LABELS[category];
            const modelCount = modelsUpdated[category];
            const parsed = parseOrNull(pricing[category]);
            const isInvalid = parsed === null;
            const isChanged = originalPricing ? (!isInvalid && parsed !== originalPricing[category]) : false;

            return (
              <div
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                  isInvalid
                    ? 'border-red-500 bg-red-500/5'
                    : selectedCategory === category
                      ? 'border-[#8A3FFC] bg-black/20'
                      : isChanged 
                        ? 'border-yellow-500 bg-yellow-500/5' 
                        : 'border-white/10 bg-black/20'
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-white font-medium">{label.title}</h3>
                  <p className="text-gray-400 text-sm">{label.description}</p>
                  {modelCount !== undefined && (
                    <p className="text-gray-500 text-xs mt-1">
                      {modelCount} AI model{modelCount !== 1 ? 's' : ''} in this category
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={pricing[category]}
                    onFocus={() => setSelectedCategory(category)}
                    onChange={(e) => handlePricingChange(category, e.target.value)}
                    className={`w-20 border rounded px-3 py-2 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50 ${
                      isInvalid
                        ? 'bg-red-500/10 border-red-500'
                        : isChanged 
                          ? 'bg-yellow-500/20 border-yellow-500' 
                          : 'bg-[#1A1A1A] border-white/10'
                    }`}
                  />
                  <span className="text-gray-400 text-sm w-16">credits</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || changesCount === 0 || hasInvalidInputs}
            className="flex-1 bg-[#8A3FFC] hover:opacity-90 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              `Update Credit Pricing${changesCount > 0 ? ` (${changesCount})` : ''}`
            )}
          </button>
          {changesCount > 0 && (
            <button
              onClick={() => {
                if (originalPricing) {
                  setPricing({
                    text_to_image: String(originalPricing.text_to_image),
                    image_to_image: String(originalPricing.image_to_image),
                    text_to_video: String(originalPricing.text_to_video),
                    image_to_video: String(originalPricing.image_to_video)
                  });
                  toast('Changes discarded', { icon: '↩️' });
                }
              }}
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


