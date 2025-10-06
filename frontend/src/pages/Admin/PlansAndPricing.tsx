import { Edit2, Plus, Trash2, Crown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminPlansService } from '../../services/adminPlansService';
import type { Plan as ApiPlan } from '../../services/plansService';

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
  isActive: boolean;
}

export default function PlansAndPricing() {
  const [activeTab, setActiveTab] = useState<'plans' | 'credits'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Editable fields for the selected plan (controlled inputs)
  const [editableName, setEditableName] = useState<string>('');
  const [editablePrice, setEditablePrice] = useState<number>(0);
  const [editableCredits, setEditableCredits] = useState<number>(0);

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

  // Sync editable fields when selected plan changes
  useEffect(() => {
    if (selectedPlanData) {
      setEditableName(selectedPlanData.name);
      setEditablePrice(selectedPlanData.price);
      setEditableCredits(selectedPlanData.credits);
    }
  }, [selectedPlanData]);

  const handleSave = async () => {
    if (!selectedPlanData) return;
    try {
      const planId = selectedPlanData.id;
      const updatePayload = {
        display_name: editableName?.trim() || selectedPlanData.name,
        price_monthly: Number(editablePrice) || 0,
        credits_included: Number(editableCredits) || 0,
      };
      
      console.log('Sending update to API:', { planId, updatePayload });
      
      const result = await adminPlansService.updatePlan(planId, updatePayload);
      
      console.log('Update result from API:', result);

      // Update local state without refetching entire list
      setPlans(prev => prev.map(p => p.id === planId ? {
        ...p,
        name: editableName?.trim() || p.name,
        price: Number(editablePrice) || 0,
        credits: Number(editableCredits) || 0,
      } : p));

      toast.success('Plan updated successfully');
    } catch (e: any) {
      console.error('Update error:', e);
      toast.error(e?.message || 'Failed to update plan');
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
          <button className="bg-[#8A3FFC] hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} />
            <span>Create Plan</span>
          </button>
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
              <div className="space-y-4">
                {loading && (
                  <div className="text-gray-400">Loading plans...</div>
                )}
                {!loading && plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-lg border p-6 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-[#823AEA] shadow-lg shadow-[#823AEA]/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <Crown className="w-6 h-6 text-[#823AEA] mt-1" />
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                          <div className="text-2xl font-bold text-white mb-1">
                            ${plan.price}
                            <span className="text-sm text-gray-400 font-normal">/monthly</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {plan.credits.toLocaleString()} credits included
                          </div>
                        </div>
                      </div>
                      {plan.isActive && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Edit Plan */}
          {selectedPlanData && (
            <div>
              <div 
                className="rounded-lg border border-white/10 p-6"
                style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Edit2 size={20} className="text-white" />
                  <h2 className="text-xl font-bold text-white">Edit Plan: {selectedPlanData.name}</h2>
                </div>

                <div className="space-y-6">
                  {/* Plan Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#823AEA]"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      value={Number.isFinite(editablePrice) ? editablePrice : 0}
                      onChange={(e) => setEditablePrice(parseFloat(e.target.value))}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#823AEA]"
                    />
                  </div>

                  {/* Credits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={Number.isFinite(editableCredits) ? editableCredits : 0}
                      onChange={(e) => setEditableCredits(parseInt(e.target.value))}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#823AEA]"
                    />
                  </div>

                  {/* Feature Access */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Feature Access
                    </label>
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
                              selectedPlanData.features[feature.key as keyof typeof selectedPlanData.features]
                                ? 'bg-[#823AEA]'
                                : 'bg-gray-600'
                            }`}
                            disabled
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                selectedPlanData.features[feature.key as keyof typeof selectedPlanData.features]
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-10">
                    <button onClick={handleSave} className="bg-[#8A3FFC] hover:opacity-90 text-white px-8 py-3 rounded-lg font-medium flex-1 mr-4">
                      Save Changes
                    </button>
                    <button className="p-4 hover:bg-red-500/20 rounded border border-white/10 text-red-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'credits' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Credit Pricing per Feature</h2>
          
          <div 
            className="rounded-lg border border-white/10 p-6"
            style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
          >
            <div className="space-y-4">
              {/* Text2Image */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-[#8A3FFC] bg-black/20">
                <div>
                  <h3 className="text-white font-medium">Text2Image</h3>
                  <p className="text-gray-400 text-sm">Cost per generation</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={2}
                    className="w-16 bg-[#8A3FFC] border border-[#8A3FFC] rounded px-3 py-1 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50"
                  />
                  <span className="text-gray-400 text-sm">credits</span>
                </div>
              </div>

              {/* Image2Image */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20">
                <div>
                  <h3 className="text-white font-medium">Image2Image</h3>
                  <p className="text-gray-400 text-sm">Cost per generation</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-16 bg-[#1A1A1A] border border-white/10 rounded px-3 py-1 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50"
                  />
                  <span className="text-gray-400 text-sm">credits</span>
                </div>
              </div>

              {/* Text2Video */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20">
                <div>
                  <h3 className="text-white font-medium">Text2Video</h3>
                  <p className="text-gray-400 text-sm">Cost per generation</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={15}
                    className="w-16 bg-[#1A1A1A] border border-white/10 rounded px-3 py-1 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50"
                  />
                  <span className="text-gray-400 text-sm">credits</span>
                </div>
              </div>

              {/* Image2Video */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20">
                <div>
                  <h3 className="text-white font-medium">Image2Video</h3>
                  <p className="text-gray-400 text-sm">Cost per generation</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-16 bg-[#1A1A1A] border border-white/10 rounded px-3 py-1 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#8A3FFC]/50"
                  />
                  <span className="text-gray-400 text-sm">credits</span>
                </div>
              </div>
            </div>

            {/* Update Button */}
            <div className="mt-6">
              <button className="w-full bg-[#8A3FFC] hover:opacity-90 text-white py-3 rounded-lg font-medium">
                Update Credit Pricing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

