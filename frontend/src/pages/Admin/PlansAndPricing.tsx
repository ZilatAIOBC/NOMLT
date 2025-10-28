import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminPlansService } from '../../services/adminPlansService';
import type { Plan as ApiPlan } from '../../services/plansService';
import PlansList from '../../components/admin/PlansList';
import EditPlanForm from '../../components/admin/EditPlanForm';
import CreditPricing from '../../components/admin/CreditPricing';
import PlansListSkeleton from '../../components/admin/PlansListSkeleton';

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: {
    textToImage: boolean;
    imageToImage: boolean;
    textToVideo: boolean;
    imageToVideo: boolean;
  };
  featuresList?: string[];
  isActive: boolean;
}

export default function PlansAndPricing() {
  const [activeTab, setActiveTab] = useState<'plans' | 'credits'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Form state handled inside EditPlanForm

  // Map API plan to UI plan shape (features remain display-only)
  const mapApiPlanToUi = (p: ApiPlan): Plan => {
    const featuresArray = Array.isArray(p.features) ? p.features : [];
    const has = (key: string) => featuresArray.includes(key);
    return {
      id: p.id,
      name: p.display_name || p.name,
      price: p.price_monthly,
      credits: p.credits_included,
      features: {
        textToImage: has('textToImage'),
        imageToImage: has('imageToImage'),
        textToVideo: has('textToVideo'),
        imageToVideo: has('imageToVideo'),
      },
      featuresList: featuresArray,
      isActive: p.is_active,
    };
  };

  // Initial fetch of admin plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const apiPlans = await adminPlansService.getAllPlans();
        const uiPlans = apiPlans.map(mapApiPlanToUi);
        setPlans(uiPlans);
        // Select first plan by default
        if (uiPlans.length > 0) {
          setSelectedPlan(uiPlans[0].id);
        }
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const selectedPlanData = useMemo(() => plans.find(plan => plan.id === selectedPlan), [plans, selectedPlan]);

  // No local form sync needed

  const handleSave = async (payload: Partial<{ display_name: string; price_monthly: number; credits_included: number; features: string[] }>) => {
    if (!selectedPlanData) return;
    const planId = selectedPlanData.id;
    // Removed console for production
    const result = await adminPlansService.updatePlan(planId, payload);
    // Removed console for production
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        name: payload.display_name !== undefined ? payload.display_name : p.name,
        price: payload.price_monthly !== undefined ? payload.price_monthly : (result.price_monthly ?? p.price),
        credits: payload.credits_included !== undefined ? payload.credits_included : (result.credits_included ?? p.credits),
        featuresList: payload.features !== undefined ? payload.features : p.featuresList,
      };
    }));
    toast.success('Plan updated successfully');

    // Optional: ensure perfect consistency by refetching the latest plans from API
    try {
      const apiPlans = await adminPlansService.getAllPlans();
      const uiPlans = apiPlans.map(mapApiPlanToUi);
      setPlans(uiPlans);
      // Keep current selection
      setSelectedPlan(planId);
    } catch (e) {
      // ignore refetch errors; local optimistic update already applied
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Plans & Pricing</h1>
            <p className="text-gray-400">Manage subscription plans and credit pricing</p>
          </div>
          {/* Create Plan button removed per request */}
        </div>

        {/* Navigation Tabs */}
        <div 
          className="flex gap-1 p-1 rounded-lg w-fit border border-white/10"
          style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
        >
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'plans'
                ? 'bg-[#8A3FFC] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'credits'
                ? 'bg-[#8A3FFC] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Credit Pricing
          </button>
        </div>
      </div>

      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Current Plans */}
          <div>
            <div 
              className="rounded-lg border border-white/10 p-6"
              style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Current Plans</h2>
              {loading ? (
                <PlansListSkeleton />
              ) : (
                <PlansList plans={plans} selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
              )}
            </div>
          </div>

          {/* Right Panel - Edit Plan */}
          {selectedPlanData && (
            <EditPlanForm plan={selectedPlanData as any} onSave={handleSave} />
          )}
        </div>
      )}

      {activeTab === 'credits' && (
        <CreditPricing />
      )}
    </div>
  );
}

